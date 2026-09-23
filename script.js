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

let reserved = [];
let ongoingBooks = [];
let reservations = [];
let pageHistory = [];
let currentPage = "dashboard";

let generatedOTP = "";
let otpExpiration = 0;

let loginSecurity = JSON.parse(
    localStorage.getItem("auLoginSecurity")
) || {
    attempts: 0,
    lockUntil: 0
};

const lockMessage =
    document.getElementById("loginLockMessage");


/* =========================
   FORGOT PASSWORD
========================= */

function forgotPassword(event) {

    event.preventDefault();

    document.getElementById(
        "forgotPasswordModal"
    ).style.display = "flex";

    document.getElementById(
        "forgotStep1"
    ).style.display = "block";

    document.getElementById(
        "forgotStep2"
    ).style.display = "none";

    document.getElementById(
        "forgotStep3"
    ).style.display = "none";
}


function closeForgotPassword() {

    document.getElementById(
        "forgotPasswordModal"
    ).style.display = "none";

    document.getElementById(
        "forgotStudentId"
    ).value = "";

    document.getElementById(
        "forgotEmail"
    ).value = "";

    document.getElementById(
        "otpInput"
    ).value = "";

    document.getElementById(
        "newPassword"
    ).value = "";

    document.getElementById(
        "confirmNewPassword"
    ).value = "";

    generatedOTP = "";
    otpExpiration = 0;
}


function sendOTP() {

    const studentId =
        document.getElementById(
            "forgotStudentId"
        ).value.trim();

    const email =
        document.getElementById(
            "forgotEmail"
        ).value.trim();

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

        alert(
            "Please enter a valid email address."
        );

        return;
    }

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
        );

    if (!account) {

        alert(
            "No library account found. Please Sign Up first."
        );

        return;
    }

    if (studentId !== account.studentId) {

        alert(
            "Student ID not found."
        );

        return;
    }

    account.email = email;

    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    generatedOTP =
        Math.floor(
            100000 +
            Math.random() * 900000
        ).toString();

    otpExpiration =
        Date.now() +
        (150 * 60 * 1000);

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

        document.getElementById(
            "forgotStep1"
        ).style.display = "none";

        document.getElementById(
            "forgotStep2"
        ).style.display = "block";

    })
    .catch(function(error) {

        console.error(
            "OTP ERROR:",
            error
        );

        alert(
            "Failed to send OTP.\n\n" +
            "Please check your EmailJS settings and try again."
        );
    });
}


function verifyOTP() {

    const enteredOTP =
        document.getElementById(
            "otpInput"
        ).value.trim();

    if (enteredOTP === "") {

        alert(
            "Please enter the OTP."
        );

        return;
    }

    if (Date.now() > otpExpiration) {

        alert(
            "OTP has expired.\n\n" +
            "Please request a new OTP."
        );

        generatedOTP = "";

        return;
    }

    if (enteredOTP !== generatedOTP) {

        alert(
            "Incorrect OTP.\n\n" +
            "Please try again."
        );

        return;
    }

    alert(
        "OTP verified successfully!"
    );

    document.getElementById(
        "forgotStep2"
    ).style.display = "none";

    document.getElementById(
        "forgotStep3"
    ).style.display = "block";
}


function resetPassword() {

    const newPassword =
        document.getElementById(
            "newPassword"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirmNewPassword"
        ).value;

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

    if (
        newPassword !== confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        return;
    }

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
        );

    if (!account) {

        alert(
            "Account not found."
        );

        return;
    }

    account.password =
        newPassword;

    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    generatedOTP = "";
    otpExpiration = 0;

    alert(
        "Password reset successfully!\n\n" +
        "You can now login using your new password."
    );

    closeForgotPassword();
}


/* =========================
   LOGIN
========================= */

function login(event) {

    if (event) {
        event.preventDefault();
    }

    const studentId =
        document.getElementById(
            "username"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value;

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

    if (password === "") {

        alert(
            "Please enter your password."
        );

        return;
    }

    if (
        loginSecurity.lockUntil > Date.now()
    ) {

        const remainingMinutes =
            Math.ceil(
                (loginSecurity.lockUntil - Date.now()) /
                60000
            );

        if (lockMessage) {

            lockMessage.textContent =
                `Login is locked. Try again in ${remainingMinutes} minute(s).`;
        }

        alert(
            `Login is locked. Please wait ${remainingMinutes} minute(s).`
        );

        return;
    }

    if (
        loginSecurity.lockUntil > 0 &&
        loginSecurity.lockUntil <= Date.now()
    ) {

        loginSecurity.lockUntil = 0;
        loginSecurity.attempts = 0;

        localStorage.setItem(
            "auLoginSecurity",
            JSON.stringify(loginSecurity)
        );

        if (lockMessage) {
            lockMessage.textContent = "";
        }
    }

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
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

        if (
            loginSecurity.attempts >= 5
        ) {

            loginSecurity.lockUntil =
                Date.now() +
                (10 * 60 * 1000);

            loginSecurity.attempts = 0;

            localStorage.setItem(
                "auLoginSecurity",
                JSON.stringify(loginSecurity)
            );

            if (lockMessage) {

                lockMessage.textContent =
                    "Too many failed attempts. Login is locked for 10 minutes.";
            }

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

        if (lockMessage) {

            lockMessage.textContent =
                `${attemptsLeft} login attempt(s) remaining.`;
        }

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

    if (lockMessage) {
        lockMessage.textContent = "";
    }

    document.getElementById(
        "loginPage"
    ).style.display = "none";

    document.getElementById(
        "mainApp"
    ).style.display = "block";

    loadUserReservations();

    pageHistory = [];

    currentPage = "dashboard";

    showDashboard(false);
}


/* =========================
   SIGN UP
========================= */

function signUp() {

    document.getElementById(
        "signupModal"
    ).style.display = "flex";
}


function closeSignUp() {

    document.getElementById(
        "signupModal"
    ).style.display = "none";

    document.getElementById(
        "signupStudentId"
    ).value = "";

    document.getElementById(
        "signupPassword"
    ).value = "";

    document.getElementById(
        "confirmPassword"
    ).value = "";
}


function createAccount() {

    const studentId =
        document.getElementById(
            "signupStudentId"
        ).value.trim();

    const password =
        document.getElementById(
            "signupPassword"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;

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

    if (
        password.length < 8 ||
        password.length > 16
    ) {

        alert(
            "Password must be 8-16 characters long."
        );

        return;
    }

    if (!/^[A-Z]/.test(password)) {

        alert(
            "The first character of the password must be uppercase."
        );

        return;
    }

    if (
        password !== confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        return;
    }

    const account = {

        studentId: studentId,

        password: password
    };

    localStorage.setItem(
        "auLibraryAccount",
        JSON.stringify(account)
    );

    alert(
        "Account created successfully! You can now login."
    );

    closeSignUp();

    document.getElementById(
        "username"
    ).value = studentId;
}


/* =========================
   PASSWORD SHOW / HIDE
========================= */

function togglePassword(
    inputId,
    iconId
) {

    const passwordInput =
        document.getElementById(
            inputId
        );

    const eyeIcon =
        document.getElementById(
            iconId
        );

    if (
        passwordInput.type ===
        "password"
    ) {

        passwordInput.type =
            "text";

        eyeIcon.textContent =
            "🙈";

    } else {

        passwordInput.type =
            "password";

        eyeIcon.textContent =
            "👁";
    }
}


/* =========================
   LOGOUT
========================= */

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) {
        return;
    }

    document.getElementById(
        "mainApp"
    ).style.display = "none";

    document.getElementById(
        "loginPage"
    ).style.display = "flex";

    document.getElementById(
        "username"
    ).value = "";

    document.getElementById(
        "password"
    ).value = "";

    reserved = [];
    ongoingBooks = [];
    reservations = [];
    pageHistory = [];

    currentPage = "dashboard";

    updateBasketCount();

    closeBasket();
    closeDeleteModal();
    closeReceipt();
}


/* =========================
   SIDEBAR
========================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    sidebar.classList.toggle(
        "active"
    );
}


function closeSidebarOnMobile() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (
        window.innerWidth <= 768
    ) {

        sidebar.classList.remove(
            "active"
        );
    }
}


/* =========================
   NAVIGATION
========================= */

function navigateTo(page) {

    if (
        currentPage !== page
    ) {

        pageHistory.push(
            currentPage
        );
    }

    currentPage = page;

    renderPage(page);

    closeSidebarOnMobile();
}


function goBack() {

    if (
        pageHistory.length === 0
    ) {

        showDashboard(false);

        return;
    }

    const previousPage =
        pageHistory.pop();

    currentPage =
        previousPage;

    renderPage(
        previousPage
    );

    closeSidebarOnMobile();
}


function renderPage(page) {

    if (
        page === "dashboard"
    ) {

        showDashboard(false);

        return;
    }

    if (
        page === "books"
    ) {

        showBookList(false);

        return;
    }

    if (
        page === "ongoing"
    ) {

        showOngoing(false);

        return;
    }

    if (
        page === "reservations"
    ) {

        showReservations(false);

        return;
    }

    if (
        page === "profile"
    ) {

        showProfile(false);
    }
}


function setPageTitle(title) {

    document.getElementById(
        "pageTitle"
    ).textContent = title;
}


/* =========================
   DASHBOARD
========================= */

function showDashboard(
    addHistory = true
) {

    if (addHistory) {

        navigateTo(
            "dashboard"
        );

        return;
    }

    currentPage =
        "dashboard";

    setPageTitle(
        "Dashboard"
    );

    const content =
        document.getElementById(
            "content"
        );

    const availableBooks =
        getAvailableBooksCount();

    content.innerHTML = `

        <div class="welcome-box">

            <h1>
                Welcome to AU Library
            </h1>

            <p>
                Search, reserve, and manage your library books online.
            </p>

        </div>

        <div class="dashboard-cards">

            <div class="dashboard-card">

                <div class="dashboard-icon">
                    &#128218;
                </div>

                <div>

                    <h3>
                        ${availableBooks}
                    </h3>

                    <p>
                        Available Books
                    </p>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="dashboard-icon">
                    📖
                </div>

                <div>

                    <h3>
                        ${reserved.length}
                    </h3>

                    <p>
                        My Reserved
                    </p>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="dashboard-icon">
                    &#128214;
                </div>

                <div>

                    <h3>
                        ${ongoingBooks.length}
                    </h3>

                    <p>
                        Ongoing Books
                    </p>

                </div>

            </div>

        </div>


        <div class="section-title">

            <h2>
                Featured Books
            </h2>

            <button
                type="button"
                class="view-button"
                onclick="showBookList()"
            >
                View All Books
            </button>

        </div>


        <div class="book-grid">

            ${
                books
                    .slice(0, 3)
                    .map(bookCardHTML)
                    .join("")
            }

        </div>
    `;
}


function getAvailableBooksCount() {

    return books.reduce(
        (
            total,
            book
        ) =>
            total +
            book.available,
        0
    );
}


/* =========================
   BOOK LIST
========================= */

function showBookList(
    addHistory = true
) {

    if (addHistory) {

        navigateTo(
            "books"
        );

        return;
    }

    currentPage =
        "books";

    setPageTitle(
        "Book List"
    );

    const content =
        document.getElementById(
            "content"
        );

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
                Book List
            </h1>

            <p>
                Search for books and add available books to your reserved list.
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

            ${
                books
                    .map(bookCardHTML)
                    .join("")
            }

        </div>
    `;
}


/* =========================
   BOOK CARD
========================= */

function bookCardHTML(book) {

    const isAvailable =
        book.available > 0;

    const alreadyReserved =
        reserved.includes(
            book.id
        );

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
                ${
                    !isAvailable ||
                    alreadyReserved
                        ? "disabled"
                        : ""
                }
            >

                ${
                    alreadyReserved
                        ? "Already Reserved"
                        : isAvailable
                            ? "Add to My Reserved"
                            : "Unavailable"
                }

            </button>

        </div>
    `;
}


/* =========================
   SEARCH
========================= */

function displayBooks(list) {

    const grid =
        document.getElementById(
            "bookGrid"
        );

    if (!grid) {
        return;
    }

    if (
        list.length === 0
    ) {

        grid.innerHTML = `

            <div class="no-results">

                No books found.

            </div>

        `;

        return;
    }

    grid.innerHTML =
        list
            .map(bookCardHTML)
            .join("");
}


function searchBooks() {

    const searchInput =
        document.getElementById(
            "bookSearch"
        );

    if (!searchInput) {
        return;
    }

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const filteredBooks =
        books.filter(
            book =>

                book.title
                    .toLowerCase()
                    .includes(search) ||

                book.author
                    .toLowerCase()
                    .includes(search)
        );

    displayBooks(
        filteredBooks
    );
}


/* =========================
   ADD TO MY RESERVED
========================= */

function addToBasket(bookId) {

    const book =
        books.find(
            item =>
                item.id === bookId
        );

    if (!book) {
        return;
    }

    if (
        book.available <= 0
    ) {

        alert(
            "This book is not available."
        );

        return;
    }

    if (
        reserved.includes(
            bookId
        )
    ) {

        alert(
            "This book is already in your reserved list."
        );

        return;
    }

    reserved.push(
        bookId
    );

    updateBasketCount();

    alert(
        `"${book.title}" has been added to your reserved list.`
    );

    if (
        currentPage === "books"
    ) {

        const searchInput =
            document.getElementById(
                "bookSearch"
            );

        const search =
            searchInput
                ? searchInput.value
                : "";

        const filteredBooks =
            books.filter(
                item =>

                    item.title
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        ) ||

                    item.author
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );

        displayBooks(
            filteredBooks
        );
    }

    if (
        currentPage === "dashboard"
    ) {

        showDashboard(
            false
        );
    }
}


/* =========================
   RESERVED COUNT
========================= */

function updateBasketCount() {

    const basketCount =
        document.getElementById(
            "basketCount"
        );

    const topBasketCount =
        document.getElementById(
            "topBasketCount"
        );

    if (basketCount) {

        basketCount.textContent =
            reserved.length;
    }

    if (topBasketCount) {

        topBasketCount.textContent =
            reserved.length;
    }
}


/* =========================
   OPEN RESERVED MODAL
========================= */

function openBasket() {

    displayBasket();

    document.getElementById(
        "basketModal"
    ).style.display = "flex";
}


/* =========================
   DISPLAY RESERVED
========================= */

function displayBasket() {

    const basketList =
        document.getElementById(
            "basketList"
        );

    if (!basketList) {
        return;
    }

    if (
        reserved.length === 0
    ) {

        basketList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📖
                </div>

                <h3>
                    Your reserved list is empty
                </h3>

                <p>
                    Add books from the Book List to reserve them.
                </p>

            </div>

        `;

        return;
    }

    basketList.innerHTML =
        reserved
            .map(
                bookId => {

                    const book =
                        books.find(
                            item =>
                                item.id ===
                                bookId
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
                }
            )
            .join("");
}


function closeBasket() {

    const modal =
        document.getElementById(
            "basketModal"
        );

    if (modal) {
        modal.style.display =
            "none";
    }
}


/* =========================
   GET SELECTED BOOKS
========================= */

function getSelectedBooks() {

    const checkboxes =
        document.querySelectorAll(
            ".basket-checkbox:checked"
        );

    return Array.from(
        checkboxes
    )
        .map(
            checkbox =>
                Number(
                    checkbox.value
                )
        );
}


/* =========================
   DELETE RESERVED BOOKS
========================= */

function deleteSelected() {

    const selected =
        getSelectedBooks();

    if (
        selected.length === 0
    ) {

        alert(
            "Please select at least one book to delete."
        );

        return;
    }

    document.getElementById(
        "deleteModal"
    ).style.display = "flex";
}


function closeDeleteModal() {

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (modal) {
        modal.style.display =
            "none";
    }
}


function confirmDelete() {

    const selected =
        getSelectedBooks();

    reserved =
        reserved.filter(
            bookId =>
                !selected.includes(
                    bookId
                )
        );

    updateBasketCount();

    displayBasket();

    closeDeleteModal();

    alert(
        "Selected book or books have been removed from your reserved list."
    );

    if (
        currentPage === "dashboard"
    ) {

        showDashboard(
            false
        );
    }
}


/* =========================
   RESERVE SELECTED
========================= */

function reserveSelected() {

    const selected =
        getSelectedBooks();

    if (
        selected.length === 0
    ) {

        alert(
            "Please select at least one book to reserve."
        );

        return;
    }

    const selectedBooks =
        selected
            .map(
                bookId =>
                    books.find(
                        book =>
                            book.id ===
                            bookId
                    )
            )
            .filter(Boolean);

    if (
        selectedBooks.length === 0
    ) {
        return;
    }

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
        ) || {};

    if (!account.studentId) {

        alert(
            "Student account not found. Please login again."
        );

        return;
    }

    const reservationId =
        "AU-" +
        Date.now()
            .toString()
            .slice(-8);

    const reservationDate =
        new Date();


    selectedBooks.forEach(
        book => {

            if (
                book.available > 0
            ) {

                book.available--;

                ongoingBooks.push({

                    id: book.id,

                    title: book.title,

                    author: book.author,

                    reservationId:
                        reservationId,

                    studentId:
                        account.studentId,

                    date:
                        reservationDate
                            .toLocaleString(),

                    status:
                        "Ongoing"
                });
            }
        }
    );


    const reservation = {

        id:
            reservationId,

        studentId:
            account.studentId,

        books:
            selectedBooks.map(
                book => ({

                    title:
                        book.title,

                    author:
                        book.author
                })
            ),

        date:
            reservationDate
                .toLocaleString(),

        status:
            "Reserved"
    };


    reservations.push(
        reservation
    );


    const allReservations =
        JSON.parse(
            localStorage.getItem(
                "auLibraryReservations"
            )
        ) || [];


    allReservations.push(
        reservation
    );


    localStorage.setItem(
        "auLibraryReservations",
        JSON.stringify(
            allReservations
        )
    );


    reserved =
        reserved.filter(
            bookId =>
                !selected.includes(
                    bookId
                )
        );


    updateBasketCount();

    closeBasket();

    createReceipt(
        reservation
    );


    if (
        currentPage ===
        "dashboard"
    ) {

        showDashboard(
            false
        );
    }
}


/* =========================
   RECEIPT
========================= */

function createReceipt(
    reservation
) {

    const receiptContent =
        document.getElementById(
            "receiptContent"
        );

    if (!receiptContent) {
        return;
    }

    const bookList =
        reservation.books
            .map(
                book => `

                    <div class="receipt-book">

                        <strong>
                            ${book.title}
                        </strong>

                        <br>

                        <span>
                            ${book.author}
                        </span>

                    </div>

                `
            )
            .join("");


    receiptContent.innerHTML = `

        <div class="receipt-details">

            <div class="receipt-row">

                <span>
                    Reservation ID
                </span>

                <span>
                    ${reservation.id}
                </span>

            </div>


            <div class="receipt-row">

                <span>
                    Student ID
                </span>

                <span>
                    ${reservation.studentId}
                </span>

            </div>


            <div class="receipt-row">

                <span>
                    Date & Time
                </span>

                <span>
                    ${reservation.date}
                </span>

            </div>


            <div class="receipt-row">

                <span>
                    Status
                </span>

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


    document.getElementById(
        "receiptModal"
    ).style.display = "flex";
}


function closeReceipt() {

    const modal =
        document.getElementById(
            "receiptModal"
        );

    if (modal) {

        modal.style.display =
            "none";
    }
}


function printReceipt() {

    const originalTitle =
        document.title;

    document.title =
        "AU Library Receipt";

    window.print();

    setTimeout(
        () => {

            document.title =
                originalTitle;

        },
        1000
    );
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

                <h1>
                    Ongoing Books
                </h1>

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

            <h1>
                Ongoing Books
            </h1>

            <p>
                Books that you currently have reserved.
            </p>

        </div>

        <div class="table-container">

            <table class="data-table">

                <thead>

                    <tr>

                        <th>
                            Book
                        </th>

                        <th>
                            Author
                        </th>

                        <th>
                            Reservation ID
                        </th>

                        <th>
                            Date
                        </th>

                        <th>
                            Status
                        </th>

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

                <h1>
                    Reservations
                </h1>

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

                        <th>
                            Reservation ID
                        </th>

                        <th>
                            Book
                        </th>

                        <th>
                            Date & Time
                        </th>

                        <th>
                            Status
                        </th>

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

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
        ) || {};

    const studentId =
        account.studentId ||
        document.getElementById("username")?.value.trim() ||
        "Student";

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

                    <span>
                        Student ID
                    </span>

                    <span>
                        ${studentId}
                    </span>

                </div>

                <div class="profile-row">

                    <span>
                        Account Type
                    </span>

                    <span>
                        Student
                    </span>

                </div>

                <div class="profile-row">

                    <span>
                        My Reserved
                    </span>

                    <span>
                        ${reserved.length}
                    </span>

                </div>

                <div class="profile-row">

                    <span>
                        Ongoing Books
                    </span>

                    <span>
                        ${ongoingBooks.length}
                    </span>

                </div>

                <div class="profile-row">

                    <span>
                        Total Reservations
                    </span>

                    <span>
                        ${reservations.length}
                    </span>

                </div>

            </div>

        </div>

    `;
}


document.addEventListener(
    "click",
    function(event) {

        const basketModal =
            document.getElementById(
                "basketModal"
            );

        const deleteModal =
            document.getElementById(
                "deleteModal"
            );

        const receiptModal =
            document.getElementById(
                "receiptModal"
            );

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


function loadUserReservations() {

    const account =
        JSON.parse(
            localStorage.getItem(
                "auLibraryAccount"
            )
        ) || null;

    if (!account) {

        reservations = [];

        ongoingBooks = [];

        return;
    }

    const allReservations =
        JSON.parse(
            localStorage.getItem(
                "auLibraryReservations"
            )
        ) || [];

    reservations =
        allReservations.filter(
            reservation =>
                reservation.studentId ===
                account.studentId
        );

    ongoingBooks = [];

    reservations.forEach(
        reservation => {

            if (
                !reservation.books
            ) {
                return;
            }

            reservation.books.forEach(
                savedBook => {

                    const book =
                        books.find(
                            item =>
                                item.title ===
                                savedBook.title
                        );

                    if (book) {

                        ongoingBooks.push({

                            id:
                                book.id,

                            title:
                                book.title,

                            author:
                                book.author,

                            reservationId:
                                reservation.id,

                            studentId:
                                reservation.studentId,

                            date:
                                reservation.date,

                            status:
                                "Ongoing"

                        });

                    }

                }
            );

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        const mainApp =
            document.getElementById(
                "mainApp"
            );

        const loginPage =
            document.getElementById(
                "loginPage"
            );

        if (mainApp) {

            mainApp.style.display =
                "none";

        }

        if (loginPage) {

            loginPage.style.display =
                "flex";

        }

        loadUserReservations();

        updateBasketCount();

    }
);