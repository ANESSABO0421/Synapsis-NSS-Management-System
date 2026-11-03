import { api } from "@/utils/api";

/** Download a protected file (PDF/CSV) through the authenticated API client. */
export async function downloadFile(path, fallbackName) {
  try {
    const res = await api.get(path, { responseType: "blob" });
    const disposition = res.headers["content-disposition"] || "";
    const name = /filename="?([^"]+)"?/.exec(disposition)?.[1] || fallbackName;
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    // Error bodies arrive as Blobs when responseType is "blob".
    const blob = err.response?.data;
    if (blob instanceof Blob) {
      try {
        const data = JSON.parse(await blob.text());
        throw new Error(data.message || "Download failed");
      } catch (parseErr) {
        if (parseErr instanceof SyntaxError) throw new Error("Download failed");
        throw parseErr;
      }
    }
    throw new Error(err.message || "Download failed");
  }
}
