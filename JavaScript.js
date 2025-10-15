async function uploadDogImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log("Predicted Breed:", data.breed);
  console.log("Confidence:", data.confidence);
}
