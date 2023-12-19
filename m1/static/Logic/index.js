const sendReq = async () => {
  document.getElementById("res").innerText = "Waiting...";
  const num = document.getElementById("Number").value;
  const res = await fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ num: num }),
  }).then((response) =>
    response.json().then((data) => ({
      numInc: data,
    }))
  );
  document.getElementById("res").innerText = res.numInc;
};
