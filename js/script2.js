 // ---------- Setup ----------
  const form = document.getElementById("characterForm");
  const summary = document.getElementById("errorSummary");
  const result = document.getElementById("result");
 
  const nameInput = document.getElementById("charName");
  const classInput = document.getElementById("charClass");
  const colorInput = document.getElementById("charColor");
  const skillInputs = [
    document.getElementById("strength"),
    document.getElementById("agility"),
    document.getElementById("magic"),
    document.getElementById("defense")
  ];
  const fields = [nameInput, classInput, colorInput, ...skillInputs];
 
  const TOTAL_POINTS = 20;
  const MIN_KEY_SKILL = 5;
 
  // Rule data
  const takenNames = ["arthur", "merlin", "gandalf", "legolas", "aragorn"];
  const classSkill = {          // which skill each class needs
    warrior: "strength",
    mage: "magic",
    archer: "agility",
    healer: "defense"
  };
  const colorHex = { red: "#dc3545", blue: "#0d6efd", green: "#198754", purple: "#6f42c1" };
 
  // ---------- Helpers ----------
  function getTotal() {
    let sum = 0;
    skillInputs.forEach(function (input) {
      sum += Number(input.value) || 0;
    });
    return sum;
  }
 
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
 
  // ---------- Validation ----------
  // Returns an error message, or "" if the field is valid
  function getMessage(field) {
    const value = field.value.trim();
 
    // Rules HTML attributes CAN express (read through the Constraint Validation API)
    if (field.validity.valueMissing || value === "") {
      return field.tagName === "SELECT" ? "Please choose an option." : "This field is required.";
    }
 
    if (field === nameInput) {
      if (value.length < 3) return "Name must have at least 3 letters.";
      if (field.validity.patternMismatch) return "Use letters only (no spaces, digits or symbols).";
 
      // Custom rule 1: name must not be taken
      if (takenNames.includes(value.toLowerCase())) {
        return "This name is already taken. Try another one.";
      }
      // Custom rule 2: name must not equal the chosen class
      if (value.toLowerCase() === classInput.value) {
        return "The name cannot be the same as the class.";
      }
    }
 
    if (skillInputs.includes(field)) {
      if (field.validity.badInput || field.validity.stepMismatch) return "Enter a whole number.";
      if (field.validity.rangeUnderflow) return "The minimum is 1.";
      if (field.validity.rangeOverflow) return "The maximum is 10.";
 
      // Custom rule 3: the main skill of the class needs 5 or more
      const needed = classSkill[classInput.value];
      if (needed === field.id && Number(value) < MIN_KEY_SKILL) {
        return capitalize(classInput.value) + " needs " + capitalize(needed) + " " + MIN_KEY_SKILL + " or more.";
      }
 
      // Custom rule 4: total must be exactly 20 (checked on the last skill)
      if (field === skillInputs[3] && getTotal() !== TOTAL_POINTS) {
        return "Skills must add up to exactly " + TOTAL_POINTS + " points (now " + getTotal() + ").";
      }
    }
 
    return "";
  }
 
  // Show or clear the error under a field
  function validateField(field) {
    const message = getMessage(field);
    const errorBox = document.getElementById(field.id + "Error");
 
    errorBox.textContent = message;
    field.classList.toggle("is-invalid", message !== "");
    field.classList.toggle("is-valid", message === "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
 
    return message === "";
  }
 
  // Re-check a field only if the user already visited it
  function revalidateIfTouched(field) {
    if (field.dataset.touched) validateField(field);
  }
 
  // ---------- Live preview ----------
  function updatePreview() {
    document.getElementById("pvName").textContent = nameInput.value.trim() || "—";
    document.getElementById("pvClass").textContent = classInput.value ? capitalize(classInput.value) : "—";
    document.getElementById("pvColor").textContent = colorInput.value ? capitalize(colorInput.value) : "—";
 
    document.getElementById("pvStrength").textContent = skillInputs[0].value || 0;
    document.getElementById("pvAgility").textContent = skillInputs[1].value || 0;
    document.getElementById("pvMagic").textContent = skillInputs[2].value || 0;
    document.getElementById("pvDefense").textContent = skillInputs[3].value || 0;
 
    const left = TOTAL_POINTS - getTotal();
    document.getElementById("pvPoints").textContent = left;
    document.getElementById("pointsLeft").textContent = left;
 
    document.getElementById("preview").style.borderColor = colorHex[colorInput.value] || "#6c757d";
  }
 
  // ---------- Events on every field ----------
  fields.forEach(function (field) {
    // On blur: first check
    field.addEventListener("blur", function () {
      field.dataset.touched = "true";
      validateField(field);
    });
 
    // On input: preview + re-check (after the first blur)
    field.addEventListener("input", function () {
      updatePreview();
      revalidateIfTouched(field);
 
      // Fields that depend on other fields
      if (field === classInput) {
        revalidateIfTouched(nameInput);
        skillInputs.forEach(revalidateIfTouched);
      }
      if (skillInputs.includes(field)) {
        revalidateIfTouched(skillInputs[3]); // total check
      }
    });
  });
 
  // ---------- Submit ----------
  form.addEventListener("submit", function (event) {
    event.preventDefault();
 
    const invalidFields = [];
    fields.forEach(function (field) {
      field.dataset.touched = "true";
      if (!validateField(field)) invalidFields.push(field);
    });
 
    if (invalidFields.length > 0) {
      summary.textContent = "The form has " + invalidFields.length +
        (invalidFields.length === 1 ? " error" : " errors") + ". Please fix the fields marked in red.";
      summary.classList.remove("d-none");
      invalidFields[0].focus();
      return;
    }
 
    summary.classList.add("d-none");
    showResult();
    resetForm();
  });
 
  // ---------- Result card (built with the DOM) ----------
  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
 
  function showResult() {
    result.innerHTML = "";
 
    const card = createElement("div", "card shadow-sm");
    card.style.border = "4px solid " + colorHex[colorInput.value];
 
    const body = createElement("div", "card-body");
    body.appendChild(createElement("h2", "h5 text-success", "✅ Character created!"));
    body.appendChild(createElement("h3", "h4", nameInput.value.trim()));
    body.appendChild(createElement("p", "mb-1", "Class: " + capitalize(classInput.value)));
    body.appendChild(createElement("p", "mb-3", "Color: " + capitalize(colorInput.value)));
 
    const list = createElement("ul", "list-group");
    skillInputs.forEach(function (input) {
      const label = capitalize(input.id) + ": " + input.value;
      list.appendChild(createElement("li", "list-group-item", label));
    });
    body.appendChild(list);
 
    card.appendChild(body);
    result.appendChild(card);
  }
 
  // ---------- Reset ----------
  function resetForm() {
    form.reset();
    fields.forEach(function (field) {
      delete field.dataset.touched;
      field.classList.remove("is-invalid", "is-valid");
      field.removeAttribute("aria-invalid");
      document.getElementById(field.id + "Error").textContent = "";
    });
    updatePreview();
  }
 
  updatePreview(); // show the empty preview (no errors on page load)