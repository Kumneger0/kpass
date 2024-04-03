export {}

const getInputElements = () => {
  const inputs = []
  document.querySelectorAll("input").forEach((elem) => {
    if (elem.type == "password") {
      inputs.push(elem)
    }
    if (elem.type == "email" || elem.name == "email") {
      inputs.push(elem)
    }
  })
  return inputs as HTMLInputElement[]
}

window.addEventListener("load", () => {
  const inputs = getInputElements()
  inputs.forEach((input) => {
    input.value = input.type
  })
})
