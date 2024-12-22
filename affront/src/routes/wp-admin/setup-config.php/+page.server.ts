import { redirect } from "@sveltejs/kit";

export const load = async () => {
    redirect(308, "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
}