async function list() {
  const apiKey = "AIzaSyBzgJ94U5Aiz9av70p6UFzzyDOVvbIJSiA";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("Models list:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}
list();
