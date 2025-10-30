document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");

  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Create modal container
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h2>📨 Create Your Account</h2>
        <form id="signupForm" novalidate>
          <label>Full Name:</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" required minlength="3">

          <label>Email Address:</label>
          <input type="email" id="email" name="email" placeholder="example@email.com" required>

          <label>Password:</label>
          <input type="password" id="password" name="password" placeholder="At least 6 characters" required minlength="6">

          <label>Phone Number:</label>
          <input type="tel" id="phone" name="phone" placeholder="10-digit mobile number" pattern="^[0-9]{10}$" required>

          <label>Date of Birth:</label>
          <input type="date" id="dob" name="dob" required>

          <label>Gender:</label>
          <div class="radio-group">
            <label><input type="radio" name="gender" value="Male" required> Male</label>
            <label><input type="radio" name="gender" value="Female"> Female</label>
            <label><input type="radio" name="gender" value="Other"> Other</label>
          </div>

          <label>Country:</label>
          <select id="country" name="country" required>
            <option value="">Select your country</option>
            <option>India</option>
            <option>USA</option>
            <option>UK</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>

          <label>
            <input type="checkbox" id="terms" required>
            I agree to the <a href="#" class="terms-link">Terms & Conditions</a>
          </label>

          <button type="submit" class="btn-submit">Register</button>
          <button type="button" id="closeModal" class="btn-cancel">Cancel</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle form submission
    const form = document.getElementById("signupForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity(); // show built-in HTML validation errors
        return;
      }

      // Store user data in localStorage (simulate registration)
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;

      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);

      alert(`Welcome, ${name}! Your account has been created.`);

      // Replace signup link with user's name
      signupBtn.textContent = name.split(" ")[0];
      signupBtn.classList.add("user-tag");

      // Remove modal
      modal.remove();
    });

    // Handle cancel
    document.getElementById("closeModal").addEventListener("click", () => {
      modal.remove();
    });
  });
});
