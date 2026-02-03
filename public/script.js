const form = document.getElementById("form");
const data = document.getElementById("data");
const getData = document.getElementById("get-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const formObj = Object.fromEntries(formData);

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObj),
    });
    const data = await res.json();
    localStorage.setItem("token", data.token);
    console.log("user signed up");
  } catch (err) {
    localStorage.removeItem("token");
  }
});

getData.addEventListener("click", async (e) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:3000/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.msg);
    }
    data.innerHTML = `<h1>Hello ${responseData.msg}</h1>`;
  } catch (err) {
    data.innerHTML = `<h1>${err.message}</h1>`;
  }
});
