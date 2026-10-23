import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session-91 remediation pins — the missing folder-DELETE route (the audit's
 * HIGH finding #3): the client (`data.ts` deleteFolder) and the Files view
 * (the folder-card trash button) have called `DELETE /api/files/folders/:id`
 * since the S13 files build, but the route file never existed — every
 * folder-delete click 404'd and no spec covered it (folders could be created
 * but never deleted through the UI).
 *
 *  S91-A the API round-trip: POST create → DELETE → GET gone (was 404).
 *  S91-B the cascade: deleting a parent folder removes its child folder AND
 *        the file stored inside the child (the schema's FolderTree
 *        self-Cascade + FileItem.folder Cascade — pinned here because the
 *        cascade is the route's documented contract).
 *  S91-C ownership: a nonexistent folder id → 404 (the findFirst
 *        { id, userId } WHERE — never a leak, never a cross-user delete).
 *  S91-D the anon gate: without a session the DELETE → 401.
 *  S91-E the UI button: the folder-card trash button removes the folder
 *        from the view (the client seam was always correct — only the
 *        route was missing).
 */

const STAMP = Date.now().toString(36);

test.describe("S91 · folder DELETE route", () => {
  test("S91-A: create → delete → gone (the round-trip)", async ({ request }) => {
    const created = await request.post("/api/files/folders", {
      data: { name: `s91-roundtrip-${STAMP}` },
    });
    expect(created.status()).toBe(201);
    const folder = (await created.json()) as { id: string };

    const deleted = await request.delete(`/api/files/folders/${folder.id}`);
    expect(deleted.status()).toBe(200);
    expect(await deleted.json()).toEqual({ ok: true });

    const list = await request.get("/api/files/folders");
    const folders = (await list.json()) as Array<{ id: string }>;
    expect(folders.some((f) => f.id === folder.id)).toBe(false);
  });

  test("S91-B: deleting a parent cascades the child folder and its file", async ({ request }) => {
    const parent = (await (
      await request.post("/api/files/folders", {
        data: { name: `s91-parent-${STAMP}` },
      })
    ).json()) as { id: string };
    const child = (await (
      await request.post("/api/files/folders", {
        data: { name: `s91-child-${STAMP}`, parentId: parent.id },
      })
    ).json()) as { id: string };

    // A tiny in-memory file inside the child (the documented base64 path).
    const uploaded = await request.post("/api/files", {
      multipart: {
        file: {
          name: `s91-cascade-${STAMP}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from("s91 cascade probe"),
        },
        folderId: child.id,
      },
    });
    expect(uploaded.status()).toBe(201);
    const file = (await uploaded.json()) as { id: string };

    const deleted = await request.delete(`/api/files/folders/${parent.id}`);
    expect(deleted.status()).toBe(200);

    const folders = (await (
      await request.get("/api/files/folders")
    ).json()) as Array<{ id: string }>;
    expect(folders.some((f) => f.id === parent.id)).toBe(false);
    expect(folders.some((f) => f.id === child.id)).toBe(false);

    const fileRes = await request.get(`/api/files/${file.id}`);
    expect(fileRes.status()).toBe(404);
  });

  test("S91-C: a nonexistent folder id is a 404, never a 500", async ({ request }) => {
    const res = await request.delete("/api/files/folders/does-not-exist-s91");
    expect(res.status()).toBe(404);
  });

  test("S91-D: the route is auth-gated (401 without a session)", async ({ request }) => {
    // The s14 pattern: an empty cookie header overrides the shared
    // storageState cookie — a session-less request on the same fixture.
    const res = await request.delete("/api/files/folders/anything-s91", {
      headers: { cookie: "" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(401);
  });

  test("S91-E: the Files view trash button removes the folder (the UI seam)", async ({ page }) => {
    test.skip(
      !(await page.request
        .post("/api/auth/login", { data: { email: DEMO_EMAIL, password: DEMO_PASSWORD } })
        .then((r) => r.ok())
        .catch(() => false)),
      "demo login unavailable"
    );
    const name = `s91-ui-${STAMP}`;
    const folder = (await (
      await page.request.post("/api/files/folders", { data: { name } })
    ).json()) as { id: string };

    await page.goto("/Files");
    const card = page.locator("div", { hasText: new RegExp(`^${name}$`) }).filter({
      has: page.getByRole("button", { name: `Delete folder "${name}"` }),
    });
    await expect(
      page.getByRole("button", { name: `Delete folder "${name}"` })
    ).toBeVisible();

    await page.getByRole("button", { name: `Delete folder "${name}"` }).click();
    await expect(
      page.getByRole("button", { name: `Delete folder "${name}"` })
    ).toBeHidden({ timeout: 10_000 });

    const folders = (await (
      await page.request.get("/api/files/folders")
    ).json()) as Array<{ id: string }>;
    expect(folders.some((f) => f.id === folder.id)).toBe(false);
  });
});
