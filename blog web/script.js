import { supabase, getSession } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  await updateAuthUI();
});

async function updateAuthUI() {
  const session = await getSession();
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const composeBtn = document.getElementById("composeBtn");

  if (session) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    composeBtn.style.display = "inline-block";
  } else {
    logoutBtn.style.display = "none";
    composeBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
  }

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}
