let books = [
    {
        id: 1,
        title: "Data Structure &...",
        author: "Micheal McMillan",
        available: 3,
        image: "images/Data Structure.jpg"
    },
    {
        id: 2,
        title: "Noli Me Tangere",
        author: "Jose Rizal",
        available: 2,
        image: "images/Nolime Tangere.jpg"
    },    
    {
        id: 3,
        title: "El Filibusterismo",
        author: "Jose Rizal",
        available: 2,
        image: "images/Filibusterismo.jpg"
    },
    {
        id: 4,
        title: "Harry Potter",
        author: "J.K. Rowling",
        available: 4,
        image: "images/Harry Potter.jpg"
    },
    {
        id: 5,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        available: 3,
        image: "images/Hobbit.jpg"
    },
    {
        id: 6,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        available: 2,
        image: "images/Mockingbird.jpg"
    }
];

let basket = [];
let ongoingBooks = [];
let reservations = [];
let pageHistory = [];
let currentPage = "dashboard";

let generatedOTP = "";
let otpExpiration = 0;
let otpTimerInterval = null;

let loginSecurity = JSON.parse(
    localStorage.getItem("auLoginSecurity")
) || {
    attempts: 0,
    lockUntil: 0
};

const lockMessage =
    document.getElementById("loginLockMessage");

function startOTPCountdown() {

    if (otpTimerInterval) {

        clearInterval(otpTimerInterval);
        otpTimerInterval = null;

    }

    const timerElement =
        document.getElementById("otpTimer");


    function updateTimer() {

        const remaining =
            otpExpiration - Date.now();


        if (remaining <= 0) {

            clearInterval(otpTimerInterval);
            otpTimerInterval = null;

            generatedOTP = "";
            otpExpiration = 0;


            if (timerElement) {

                timerElement.textContent =
                    "OTP expired. Please request a new OTP.";

            }

            return;

        }

        const totalSeconds =
            Math.floor(remaining / 1000);


        const minutes =
            Math.floor(totalSeconds / 60);


        const seconds =
            totalSeconds % 60;


        if (timerElement) {

            timerElement.textContent =
                "OTP expires in: " +
                String(minutes).padStart(3, "0") +
                ":" +
                String(seconds).padStart(2, "0");

        }

    }

    updateTimer();

    otpTimerInterval =
        setInterval(updateTimer, 1000);

}

function forgotPassword(event) {

    event.preventDefault();

    document.getElementById("forgotPasswordModal").style.display = "flex";

    document.getElementById("forgotStep1").style.display = "block";
    document.getElementById("forgotStep2").style.display = "none";
    document.getElementById("forgotStep3").style.display = "none";

}


function closeForgotPassword() {

    document.getElementById("forgotPasswordModal").style.display = "none";

    document.getElementById("forgotStudentId").value = "";
    document.getElementById("forgotEmail").value = "";
    document.getElementById("otpInput").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";

    if (otpTimerInterval) {

        clearInterval(otpTimerInterval);
        otpTimerInterval = null;

    }

    generatedOTP = "";
    otpExpiration = 0;

    const timerElement = document.getElementById("otpTimer");

    if (timerElement) {

        timerElement.textContent =
            "OTP expires in: 150:00";

    }

}


function sendOTP() {

    const studentId =
        document.getElementById("forgotStudentId").value.trim();

    const email =
        document.getElementById("forgotEmail").value.trim();

    if (studentId === "") {

        alert("Please enter your Student ID.");
        return;

    }

    if (!/^[0-9-]+$/.test(studentId)) {

        alert(
            "Student ID must contain numbers and - only."
        );

        return;

    }

    if (email === "") {

        alert("Please enter your email address.");
        return;

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email address.");
        return;

    }

    const account = JSON.parse(
        localStorage.getItem("auLibraryAccount")
    );


    if (!account) {

        alert(
            "No library account found.\n\nPlease Sign Up first."
        );

        return;

    }

    if (studentId !== account.studentId) {

        alert("Student ID not found.");

        return;

    }

    account.email = email;

    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    generatedOTP =
        Math.floor(
            100000 + Math.random() * 900000
        ).toString();

    otpExpiration =
        Date.now() + (150 * 60 * 1000);


    const templateParams = {

        to_email: email,
        student_id: studentId,
        otp: generatedOTP

    };

    emailjs.send(
        "service_md5pntj",
        "template_xpxz9oa",
        templateParams
    )

    .then(function(response) {

        console.log(
            "OTP SENT:",
            response.status,
            response.text
        );


        alert(
            "OTP has been sent to your email.\n\n" +
            "Please check your inbox or spam folder."
        );

        document.getElementById("forgotStep1").style.display = "none";

        document.getElementById("forgotStep2").style.display = "block";


        document.getElementById("otpInput").value = "";

        document.getElementById("otpInput").focus();


        startOTPCountdown();

    })

    .catch(function(error) {

        console.error("OTP ERROR:", error);

        alert(
            "FAILED TO SEND OTP\n\n" +
            "Status: " +
            (error.status || "Unknown") +
            "\n\nMessage: " +
            (
                error.text ||
                error.message ||
                "Unknown EmailJS error"
            )
        );

    });

}


function verifyOTP() {

    const enteredOTP =
        document.getElementById("otpInput").value.trim();

    if (enteredOTP === "") {

        alert("Please enter the OTP.");
        return;

    }

    if (
        otpExpiration === 0 ||
        Date.now() > otpExpiration
    ) {

        if (otpTimerInterval) {

            clearInterval(otpTimerInterval);
            otpTimerInterval = null;

        }

        generatedOTP = "";
        otpExpiration = 0;


        const timerElement =
            document.getElementById("otpTimer");


        if (timerElement) {

            timerElement.textContent =
                "OTP expired. Please request a new OTP.";

        }


        alert(
            "OTP has expired.\n\n" +
            "Please request a new OTP."
        );

        return;

    }

    if (enteredOTP !== generatedOTP) {

        alert(
            "Incorrect OTP.\n\n" +
            "Please try again."
        );

        return;

    }

    if (otpTimerInterval) {

        clearInterval(otpTimerInterval);
        otpTimerInterval = null;

    }


    alert("OTP verified successfully!");

    document.getElementById("forgotStep2").style.display = "none";

    document.getElementById("forgotStep3").style.display = "block";


    document.getElementById("newPassword").focus();

}


function resetPassword() {

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmNewPassword").value;

    if (
        newPassword.length < 8 ||
        newPassword.length > 16
    ) {

        alert(
            "Password must be 8–16 characters long."
        );

        return;

    }

    if (!/^[A-Z]/.test(newPassword)) {

        alert(
            "The first character of the password must be uppercase."
        );

        return;

    }

    if (confirmPassword === "") {

        alert(
            "Please confirm your new password."
        );

        return;

    }


    if (newPassword !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;

    }

    const account = JSON.parse(
        localStorage.getItem("auLibraryAccount")
    );


    if (!account) {

        alert(
            "Account not found."
        );

        return;

    }

    account.password = newPassword;


    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    generatedOTP = "";
    otpExpiration = 0;


    if (otpTimerInterval) {

        clearInterval(otpTimerInterval);
        otpTimerInterval = null;

    }

    alert(
        "Password changed successfully!\n\n" +
        "Your new password has been saved.\n\n" +
        "You can now login using your new password."
    );

    closeForgotPassword();

    document.getElementById("loginPage").style.display = "flex";

}

function login(event) {

    if (event) {
        event.preventDefault();
    }
    const studentId =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    if (studentId === "") {

        alert("Please enter your Student ID.");

        return;
    }

    if (!/^[0-9-]+$/.test(studentId)) {

        alert(
            "Student ID must contain numbers and - only."
        );

        return;
    }

    if (password === "") {

        alert("Please enter your password.");

        return;
    }

    const account =
        JSON.parse(
            localStorage.getItem("auLibraryAccount")
        );


    if (!account) {

        alert(
            "No account found. Please Sign Up first."
        );

        return;
    }

    if (
        studentId !== account.studentId ||
        password !== account.password
    ) {

        loginSecurity.attempts++;

        if (loginSecurity.attempts >= 5) {

            loginSecurity.lockUntil =
                Date.now() +
                (10 * 60 * 1000);

            loginSecurity.attempts = 0;


            localStorage.setItem(
                "auLoginSecurity",
                JSON.stringify(loginSecurity)
            );


            lockMessage.textContent =
                "Too many failed attempts. Login is locked for 10 minutes.";


            alert(
                "You have reached the maximum of 5 failed login attempts.\n\n" +
                "Please wait 10 minutes before trying again."
            );

            return;
        }

        localStorage.setItem(
            "auLoginSecurity",
            JSON.stringify(loginSecurity)
        );


        const attemptsLeft =
            5 - loginSecurity.attempts;


        lockMessage.textContent =
            `${attemptsLeft} login attempt(s) remaining.`;


        alert(
            "Incorrect Student ID or Password.\n\n" +
            `${attemptsLeft} attempt(s) remaining.`
        );

        return;
    }

    loginSecurity.attempts = 0;
    loginSecurity.lockUntil = 0;


    localStorage.setItem(
        "auLoginSecurity",
        JSON.stringify(loginSecurity)
    );


    lockMessage.textContent = "";

    document.getElementById("loginPage").style.display =
        "none";

    document.getElementById("mainApp").style.display =
        "block";


    pageHistory = [];

    currentPage = "dashboard";


    showDashboard(false);
}

function signUp() {
    document.getElementById("signupModal").style.display = "flex";
}


function closeSignUp() {
    document.getElementById("signupModal").style.display = "none";

    document.getElementById("signupStudentId").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("confirmPassword").value = "";
}

function createAccount() {

    const studentId =
        document.getElementById("signupStudentId").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (studentId === "") {

        alert(
            "Please enter your Student ID."
        );

        return;

    }


    if (!/^[0-9-]+$/.test(studentId)) {

        alert(
            "Student ID must contain numbers and - only."
        );

        return;

    }

    const existingAccount =
        JSON.parse(
            localStorage.getItem("auLibraryAccount")
        );


    if (
        existingAccount &&
        existingAccount.studentId === studentId
    ) {

        alert(
            "This Student ID is already registered.\n\n" +
            "Please login using your existing account."
        );

        closeSignUp();

        document.getElementById("username").value =
            studentId;

        return;

    }

    if (
        password.length < 8 ||
        password.length > 16
    ) {

        alert(
            "Password must be 8–16 characters long."
        );

        return;

    }

    if (!/^[A-Z]/.test(password)) {

        alert(
            "The first character of the password must be uppercase."
        );

        return;

    }

    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;

    }

    const account = {

        studentId: studentId,

        password: password,

        email: ""

    };

    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    const savedAccount =
        JSON.parse(
            localStorage.getItem("auLibraryAccount")
        );


    if (!savedAccount) {

        alert(
            "Something went wrong while saving your account."
        );

        return;

    }

    alert(
        "Account created successfully!\n\n" +
        "Your account has been automatically saved.\n\n" +
        "You can now login without signing up again."
    );


    closeSignUp();

    document.getElementById("username").value =
        studentId;


    document.getElementById("password").value = "";

}

function togglePassword(inputId, iconId) {

    const passwordInput =
        document.getElementById(inputId);

    const eyeIcon =
        document.getElementById(iconId);

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        eyeIcon.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        eyeIcon.textContent = "👁";
    }
}

function logout() {
    const confirmed =
        confirm("Are you sure you want to logout?");

    if (!confirmed) {
        return;
    }

    document.getElementById("mainApp")
        .style.display = "none";

    document.getElementById("loginPage")
        .style.display = "flex";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    basket = [];
    ongoingBooks = [];
    reservations = [];
    pageHistory = [];
    currentPage = "dashboard";

    updateBasketCount();

    closeBasket();
    closeDeleteModal();
    closeReceipt();
}


function toggleSidebar() {
    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.toggle("active");
}


function closeSidebarOnMobile() {
    const sidebar =
        document.getElementById("sidebar");

    if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
    }
}


function navigateTo(page) {
    if (currentPage !== page) {
        pageHistory.push(currentPage);
    }

    currentPage = page;

    renderPage(page);

    closeSidebarOnMobile();
}


function goBack() {
    if (pageHistory.length === 0) {
        showDashboard(false);
        return;
    }

    const previousPage =
        pageHistory.pop();

    currentPage = previousPage;

    renderPage(previousPage);

    closeSidebarOnMobile();
}


function renderPage(page) {
    if (page === "dashboard") {
        showDashboard(false);
        return;
    }

    if (page === "books") {
        showBookList(false);
        return;
    }

    if (page === "ongoing") {
        showOngoing(false);
        return;
    }

    if (page === "reservations") {
        showReservations(false);
        return;
    }

    if (page === "profile") {
        showProfile(false);
    }
}


function setPageTitle(title) {
    document.getElementById("pageTitle")
        .textContent = title;
}


function showDashboard(addHistory = true) {
    if (addHistory) {
        navigateTo("dashboard");
        return;
    }

    currentPage = "dashboard";
    setPageTitle("Dashboard");

    const content =
        document.getElementById("content");

    const availableBooks =
        getAvailableBooksCount();

    content.innerHTML = `
        <div class="welcome-box">
            <h1>Welcome to AU Library</h1>
            <p>
                Search, reserve, and manage your library books online.
            </p>
        </div>

        <div class="dashboard-cards">

            <div class="dashboard-card">
                <div class="dashboard-icon">&#128218;</div>

                <div>
                    <h3>${availableBooks}</h3>
                    <p>Available Books</p>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-icon">&#128722;</div>

                <div>
                    <h3>${basket.length}</h3>
                    <p>Books in Basket</p>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-icon">&#128214;</div>

                <div>
                    <h3>${ongoingBooks.length}</h3>
                    <p>Ongoing Books</p>
                </div>
            </div>

        </div>

        <div class="section-title">
            <h2>Featured Books</h2>

            <button
                type="button"
                class="view-button"
                onclick="showBookList()"
            >
                View All Books
            </button>
        </div>

        <div class="book-grid">
            ${books.slice(0, 3).map(bookCardHTML).join("")}
        </div>
    `;
}


function getAvailableBooksCount() {
    return books.reduce(
        (total, book) =>
            total + book.available,
        0
    );
}


function showBookList(addHistory = true) {
    if (addHistory) {
        navigateTo("books");
        return;
    }

    currentPage = "books";
    setPageTitle("Book List");

    const content =
        document.getElementById("content");

    content.innerHTML = `
        <button
            type="button"
            class="back-button"
            onclick="goBack()"
        >
            ← Back
        </button>

        <div class="page-header">
            <h1>Book List</h1>

            <p>
                Search for books and add available books to your basket.
            </p>
        </div>

        <div class="search-container">

            <input
                type="text"
                class="search-input"
                id="bookSearch"
                placeholder="Search by book title or author..."
                oninput="searchBooks()"
            >

        </div>

        <div
            class="book-grid"
            id="bookGrid"
        >
            ${books.map(bookCardHTML).join("")}
        </div>
    `;
}


function bookCardHTML(book) {
    const isAvailable =
        book.available > 0;

    const alreadyInBasket =
        basket.includes(book.id);

    return `
        <div class="book-card">

            <div class="book-cover">
                <img
                    src="${book.image}"
                    alt="${book.title}"
                >
            </div>

            <h3>
                ${book.title}
            </h3>

            <p class="book-author">
                ${book.author}
            </p>

            <span class="availability ${
                isAvailable
                    ? ""
                    : "unavailable"
            }">
                ${
                    isAvailable
                        ? `${book.available} Available`
                        : "Not Available"
                }
            </span>

            <button
                type="button"
                class="add-button"
                onclick="addToBasket(${book.id})"
                ${!isAvailable || alreadyInBasket ? "disabled" : ""}
            >
                ${
                    alreadyInBasket
                        ? "Already in Basket"
                        : isAvailable
                            ? "Add to Basket"
                            : "Unavailable"
                }
            </button>

        </div>
    `;
}


function displayBooks(list) {
    const grid =
        document.getElementById("bookGrid");

    if (!grid) {
        return;
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                No books found.
            </div>
        `;

        return;
    }

    grid.innerHTML =
        list.map(bookCardHTML).join("");
}


function searchBooks() {
    const searchInput =
        document.getElementById("bookSearch");

    if (!searchInput) {
        return;
    }

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const filteredBooks =
        books.filter(book =>
            book.title
                .toLowerCase()
                .includes(search) ||
            book.author
                .toLowerCase()
                .includes(search)
        );

    displayBooks(filteredBooks);
}


function addToBasket(bookId) {
    const book =
        books.find(item =>
            item.id === bookId
        );

    if (!book) {
        return;
    }

    if (book.available <= 0) {
        alert("This book is not available.");
        return;
    }

    if (basket.includes(bookId)) {
        alert("This book is already in your basket.");
        return;
    }

    basket.push(bookId);

    updateBasketCount();

    alert(
        `"${book.title}" has been added to your basket.`
    );

    if (currentPage === "books") {
        const searchInput =
            document.getElementById("bookSearch");

        const search =
            searchInput
                ? searchInput.value
                : "";

        const filteredBooks =
            books.filter(item =>
                item.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.author
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );

        displayBooks(filteredBooks);
    }

    if (currentPage === "dashboard") {
        showDashboard(false);
    }
}


function updateBasketCount() {
    const basketCount =
        document.getElementById("basketCount");

    const topBasketCount =
        document.getElementById("topBasketCount");

    if (basketCount) {
        basketCount.textContent =
            basket.length;
    }

    if (topBasketCount) {
        topBasketCount.textContent =
            basket.length;
    }
}


function openBasket() {
    displayBasket();

    document.getElementById("basketModal")
        .style.display = "flex";
}


function displayBasket() {
    const basketList =
        document.getElementById("basketList");

    if (basket.length === 0) {
        basketList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    &#128722;
                </div>

                <h3>Your basket is empty</h3>

                <p>
                    Add books from the Book List.
                </p>

            </div>
        `;

        return;
    }

    basketList.innerHTML =
        basket.map(bookId => {

            const book =
                books.find(item =>
                    item.id === bookId
                );

            if (!book) {
                return "";
            }

            return `
                <div class="basket-item">

                    <input
                        type="checkbox"
                        class="basket-checkbox"
                        value="${book.id}"
                    >

                    <div class="basket-book-icon">
                        &#128214;
                    </div>

                    <div class="basket-item-info">

                        <h3>
                            ${book.title}
                        </h3>

                        <p>
                            ${book.author}
                        </p>

                    </div>

                </div>
            `;
        }).join("");
}


function closeBasket() {
    document.getElementById("basketModal")
        .style.display = "none";
}


function getSelectedBooks() {
    const checkboxes =
        document.querySelectorAll(
            ".basket-checkbox:checked"
        );

    return Array.from(checkboxes)
        .map(checkbox =>
            Number(checkbox.value)
        );
}


function deleteSelected() {
    const selected =
        getSelectedBooks();

    if (selected.length === 0) {
        alert(
            "Please select at least one book to delete."
        );

        return;
    }

    document.getElementById("deleteModal")
        .style.display = "flex";
}


function closeDeleteModal() {
    document.getElementById("deleteModal")
        .style.display = "none";
}


function confirmDelete() {
    const selected =
        getSelectedBooks();

    basket =
        basket.filter(
            bookId =>
                !selected.includes(bookId)
        );

    updateBasketCount();
    displayBasket();
    closeDeleteModal();

    alert(
        "Selected book or books have been deleted from your basket."
    );

    if (currentPage === "dashboard") {
        showDashboard(false);
    }
}


function reserveSelected() {
    const selected =
        getSelectedBooks();

    if (selected.length === 0) {
        alert(
            "Please select at least one book to reserve."
        );

        return;
    }

    const selectedBooks =
        selected
            .map(bookId =>
                books.find(book =>
                    book.id === bookId
                )
            )
            .filter(Boolean);

    if (selectedBooks.length === 0) {
        return;
    }

    const reservationId =
        "AU-" +
        Date.now()
            .toString()
            .slice(-8);

    const reservationDate =
        new Date();

    selectedBooks.forEach(book => {

        if (book.available > 0) {
            book.available--;

            ongoingBooks.push({
                id: book.id,
                title: book.title,
                author: book.author,
                reservationId: reservationId,
                date: reservationDate.toLocaleString(),
                status: "Ongoing"
            });
        }
    });

    const reservation = {
        id: reservationId,
        books: selectedBooks.map(book => ({
            title: book.title,
            author: book.author
        })),
        date: reservationDate.toLocaleString(),
        status: "Reserved"
    };

    reservations.push(reservation);

    basket =
        basket.filter(
            bookId =>
                !selected.includes(bookId)
        );

    updateBasketCount();

    closeBasket();

    createReceipt(reservation);

    if (currentPage === "dashboard") {
        showDashboard(false);
    }
}


function createReceipt(reservation) {
    const receiptContent =
        document.getElementById("receiptContent");

    const bookList =
        reservation.books
            .map(book => `
                <div class="receipt-book">
                    <strong>
                        ${book.title}
                    </strong>
                    <br>
                    <span>
                        ${book.author}
                    </span>
                </div>
            `)
            .join("");

    receiptContent.innerHTML = `
        <div class="receipt-details">

            <div class="receipt-row">
                <span>Reservation ID</span>
                <span>
                    ${reservation.id}
                </span>
            </div>

            <div class="receipt-row">
                <span>Date & Time</span>
                <span>
                    ${reservation.date}
                </span>
            </div>

            <div class="receipt-row">
                <span>Status</span>
                <span>
                    ${reservation.status}
                </span>
            </div>

        </div>

        <div class="receipt-books">

            <h3>
                Reserved Books
            </h3>

            ${bookList}

        </div>

        <div class="receipt-footer">
            Please keep this receipt for your library reservation.
        </div>
    `;

    document.getElementById("receiptModal")
        .style.display = "flex";
}


function closeReceipt() {
    document.getElementById("receiptModal")
        .style.display = "none";
}


function printReceipt() {

    const originalTitle = document.title;

    document.title = "AU Library Receipt";

    window.print();

    setTimeout(() => {
        document.title = originalTitle;
    }, 1000);
}


function showOngoing(addHistory = true) {
    if (addHistory) {
        navigateTo("ongoing");
        return;
    }

    currentPage = "ongoing";
    setPageTitle("Ongoing Books");

    const content =
        document.getElementById("content");

    let tableContent = "";

    if (ongoingBooks.length === 0) {

        content.innerHTML = `
            <button
                type="button"
                class="back-button"
                onclick="goBack()"
            >
                ← Back
            </button>

            <div class="page-header">
                <h1>Ongoing Books</h1>
                <p>
                    Books that you currently have reserved.
                </p>
            </div>

            <div class="empty-state">

                <div class="empty-icon">
                    &#128214;
                </div>

                <h3>
                    No ongoing books
                </h3>

                <p>
                    Your reserved books will appear here.
                </p>

            </div>
        `;

        return;
    }

    ongoingBooks.forEach(book => {
        tableContent += `
            <tr>

                <td>
                    ${book.title}
                </td>

                <td>
                    ${book.author}
                </td>

                <td>
                    ${book.reservationId}
                </td>

                <td>
                    ${book.date}
                </td>

                <td>
                    <span class="status status-ongoing">
                        ${book.status}
                    </span>
                </td>

            </tr>
        `;
    });

    content.innerHTML = `
        <button
            type="button"
            class="back-button"
            onclick="goBack()"
        >
            ← Back
        </button>

        <div class="page-header">
            <h1>Ongoing Books</h1>

            <p>
                Books that you currently have reserved.
            </p>
        </div>

        <div class="table-container">

            <table class="data-table">

                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Author</th>
                        <th>Reservation ID</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${tableContent}
                </tbody>

            </table>

        </div>
    `;
}


function showReservations(addHistory = true) {
    if (addHistory) {
        navigateTo("reservations");
        return;
    }

    currentPage = "reservations";
    setPageTitle("Reservations");

    const content =
        document.getElementById("content");

    if (reservations.length === 0) {

        content.innerHTML = `
            <button
                type="button"
                class="back-button"
                onclick="goBack()"
            >
                ← Back
            </button>

            <div class="page-header">
                <h1>Reservations</h1>

                <p>
                    Your reservation history.
                </p>
            </div>

            <div class="empty-state">

                <div class="empty-icon">
                    &#128203;
                </div>

                <h3>
                    No reservations yet
                </h3>

                <p>
                    Your reservation history will appear here.
                </p>

            </div>
        `;

        return;
    }

    let tableContent = "";

    reservations.forEach(reservation => {

        const bookNames =
            reservation.books
                .map(book => book.title)
                .join(", ");

        tableContent += `
            <tr>

                <td>
                    ${reservation.id}
                </td>

                <td>
                    ${bookNames}
                </td>

                <td>
                    ${reservation.date}
                </td>

                <td>
                    <span class="status status-reserved">
                        ${reservation.status}
                    </span>
                </td>

            </tr>
        `;
    });

    content.innerHTML = `
        <button
            type="button"
            class="back-button"
            onclick="goBack()"
        >
            ← Back
        </button>

        <div class="page-header">

            <h1>
                Reservations
            </h1>

            <p>
                Your reservation history.
            </p>

        </div>

        <div class="table-container">

            <table class="data-table">

                <thead>

                    <tr>
                        <th>Reservation ID</th>
                        <th>Book</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
                    ${tableContent}
                </tbody>

            </table>

        </div>
    `;
}


function showProfile(addHistory = true) {
    if (addHistory) {
        navigateTo("profile");
        return;
    }

    currentPage = "profile";
    setPageTitle("Profile");

    const username =
        document.getElementById("username")
            .value.trim();

    const studentId =
        username || "Student";

    const avatar =
        studentId
            .charAt(0)
            .toUpperCase();

    const content =
        document.getElementById("content");

    content.innerHTML = `
        <button
            type="button"
            class="back-button"
            onclick="goBack()"
        >
            ← Back
        </button>

        <div class="page-header">

            <h1>
                Profile
            </h1>

            <p>
                Your student account information.
            </p>

        </div>

        <div class="profile-card">

            <div class="profile-header">

                <div class="profile-avatar">
                    ${avatar}
                </div>

                <div>

                    <h2>
                        ${studentId}
                    </h2>

                    <p>
                        AU Student
                    </p>

                </div>

            </div>

            <div class="profile-info">

                <div class="profile-row">
                    <span>Student ID</span>
                    <span>${studentId}</span>
                </div>

                <div class="profile-row">
                    <span>Account Type</span>
                    <span>Student</span>
                </div>

                <div class="profile-row">
                    <span>Books in Basket</span>
                    <span>${basket.length}</span>
                </div>

                <div class="profile-row">
                    <span>Ongoing Books</span>
                    <span>${ongoingBooks.length}</span>
                </div>

                <div class="profile-row">
                    <span>Total Reservations</span>
                    <span>${reservations.length}</span>
                </div>

            </div>

        </div>
    `;
}


document.addEventListener(
    "click",
    function(event) {

        const basketModal =
            document.getElementById("basketModal");

        const deleteModal =
            document.getElementById("deleteModal");

        const receiptModal =
            document.getElementById("receiptModal");

        if (
            event.target === basketModal
        ) {
            closeBasket();
        }

        if (
            event.target === deleteModal
        ) {
            closeDeleteModal();
        }

        if (
            event.target === receiptModal
        ) {
            closeReceipt();
        }
    }
);


document.addEventListener(
    "DOMContentLoaded",
    function() {

        document.getElementById("mainApp")
            .style.display = "none";

        document.getElementById("loginPage")
            .style.display = "flex";

        updateBasketCount();

    }
);