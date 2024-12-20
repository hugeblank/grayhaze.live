import { redirect } from "@sveltejs/kit";

export const load = async () => {
    redirect(308, "https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUjcmljayBhc3RsZXkgbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA%3D")
}