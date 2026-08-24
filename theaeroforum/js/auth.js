// ========================================
// THE AERO FORUM — AUTH.JS
// ========================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://cmferfyrsinjponhuuru.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jvJ7dQqUGe9U3znFapsdKA_4RpwV52Y";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// HTML ESCAPING
// ========================================

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// SIGN UP
// ========================================

const signupForm =
    document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const usernameInput =
            document.getElementById("username");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const confirmPasswordInput =
            document.getElementById("confirm-password");

        const message =
            document.getElementById("signup-message");

        const username =
            usernameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // --------------------------------
        // Validation
        // --------------------------------

        if (username.length < 3) {
            message.textContent =
                "Username must be at least 3 characters.";
            return;
        }

        if (username.length > 24) {
            message.textContent =
                "Username must be 24 characters or less.";
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            message.textContent =
                "Username can only contain letters, numbers and underscores.";
            return;
        }

        if (password.length < 8) {
            message.textContent =
                "Password must be at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent =
                "Passwords do not match.";
            return;
        }


        const button =
            signupForm.querySelector(
                "button[type='submit']"
            );

        button.disabled = true;
        button.textContent = "Creating account...";
        message.textContent = "";


        try {

            // --------------------------------
            // Check username
            // --------------------------------

            const {
                data: existingProfile,
                error: usernameError
            } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", username)
                .maybeSingle();


            if (usernameError) {

                console.error(
                    "Username check error:",
                    usernameError
                );

                message.textContent =
                    "Could not check username.";

                return;
            }


            if (existingProfile) {

                message.textContent =
                    "That username is already taken.";

                return;
            }


            // --------------------------------
            // Create Auth user
            // --------------------------------

            const {
                data,
                error
            } = await supabase.auth.signUp({

                email: email,

                password: password,

                options: {
                    data: {
                        username: username
                    }
                }

            });


            if (error) {

                console.error(
                    "Signup error:",
                    error
                );

                message.textContent =
                    error.message;

                return;
            }


            // --------------------------------
            // Success
            // --------------------------------

            console.log(
                "✅ Account created:",
                data.user
            );

            message.textContent =
                "Account created successfully! 🌊";

            signupForm.reset();

            button.textContent =
                "Account Created ✓";


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Unexpected signup error:",
                error
            );

            message.textContent =
                "Something went wrong. Please try again.";


        } finally {

            if (!button.textContent.includes("Account Created")) {

                button.disabled = false;

                button.textContent =
                    "Create Account ✨";

            }

        }

    });

}


// ========================================
// LOGIN
// ========================================

const loginForm =
    document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("login-message");

        const button =
            loginForm.querySelector(
                "button[type='submit']"
            );


        message.textContent = "";

        button.disabled = true;

        button.textContent =
            "Logging in...";


        try {

            const {
                data,
                error
            } = await supabase.auth.signInWithPassword({

                email,
                password

            });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                message.textContent =
                    error.message;

                return;
            }


            if (!data.user) {

                message.textContent =
                    "Could not log you in.";

                return;
            }


            console.log(
                "✅ Logged in:",
                data.user
            );


            message.textContent =
                "Welcome back! 🌊";

            button.textContent =
                "Logged In ✓";


            setTimeout(() => {

                window.location.href =
                    "profile.html";

            }, 800);


        } catch (error) {

            console.error(
                "Unexpected login error:",
                error
            );

            message.textContent =
                "Something went wrong. Please try again.";


        } finally {

            if (!button.textContent.includes("Logged In")) {

                button.disabled = false;

                button.textContent =
                    "Log In 🌊";

            }

        }

    });

}


// ========================================
// AUTH NAVIGATION
// ========================================

async function setupAuthNavigation() {

    const authNav =
        document.getElementById("auth-nav");

    if (!authNav) {
        return;
    }


    console.log("🧭 Loading auth navigation...");


    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();


    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        return;
    }


    // ========================================
    // LOGGED OUT
    // ========================================

    if (!session) {

        authNav.innerHTML = `

            <a
                href="signup.html"
                class="nav-button"
            >
                Sign Up
            </a>

            <a
                href="login.html"
                class="nav-button"
            >
                Log In
            </a>

        `;

        console.log(
            "👤 No active session."
        );

        return;
    }


    // ========================================
    // LOGGED IN
    // ========================================

    const user =
        session.user;


    console.log(
        "👤 Current user:",
        user.id
    );


    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select(`
            username,
            display_name,
            avatar_url,
            rank,
            role
        `)
        .eq("id", user.id)
        .single();


    if (profileError) {

        console.error(
            "Navbar profile error:",
            profileError
        );


        // Still give user a profile button
        authNav.innerHTML = `

            <a
                href="profile.html"
                class="nav-button"
            >
                👤 Profile
            </a>

        `;

        return;
    }


    const username =
        profile.username ||
        profile.display_name ||
        "Aero User";


    const avatar =
        profile.avatar_url ||
        "assets/default-avatar.png";


    authNav.innerHTML = `

        <div class="dropdown">

            <button
                class="profile-menu-button dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >

                <img
                    src="${escapeHTML(avatar)}"
                    class="nav-avatar"
                    alt="Profile"
                >

                <span>
                    ${escapeHTML(username)}
                </span>

            </button>


            <ul
                class="dropdown-menu dropdown-menu-end aero-dropdown"
            >

                <li>

                    <a
                        class="dropdown-item"
                        href="profile.html"
                    >
                        👤 Profile
                    </a>

                </li>


                <li>

                    <a
                        class="dropdown-item"
                        href="settings.html"
                    >
                        ⚙️ Settings
                    </a>

                </li>


                <li>
                    <hr class="dropdown-divider">
                </li>


                <li>

                    <button
                        id="logout-button"
                        class="dropdown-item"
                        type="button"
                    >
                        🚪 Close session
                    </button>

                </li>

            </ul>

        </div>

    `;


    // ========================================
    // LOGOUT
    // ========================================

    const logoutButton =
        document.getElementById("logout-button");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                const {
                    error
                } = await supabase.auth.signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    return;
                }


                window.location.href =
                    "index.html";

            }
        );

    }

}


// ========================================
// LOAD PROFILE PAGE
// ========================================

async function loadProfilePage() {

    const usernameElement =
        document.getElementById("profile-username");


    // Not profile.html
    if (!usernameElement) {
        return;
    }


    const avatarElement =
        document.getElementById("profile-avatar");

    const rankElement =
        document.getElementById("profile-rank");

    const roleElement =
        document.getElementById("profile-role");

    const bioElement =
        document.getElementById("profile-bio");

    const createdElement =
        document.getElementById("profile-created");

    const usernameInfoElement =
        document.getElementById("profile-username-info");

    const rankInfoElement =
        document.getElementById("profile-rank-info");

    const roleInfoElement =
        document.getElementById("profile-role-info");

    const actionsElement =
        document.getElementById("profile-actions");


    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;
    }


    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select(`
            username,
            display_name,
            avatar_url,
            rank,
            role,
            bio,
            created_at
        `)
        .eq("id", user.id)
        .single();


    if (profileError || !profile) {

        console.error(
            "Profile loading error:",
            profileError
        );

        usernameElement.textContent =
            "Profile unavailable";

        return;
    }


    // ========================================
    // USERNAME
    // ========================================

    const displayName =
        profile.display_name ||
        profile.username ||
        "Aero User";


    usernameElement.textContent =
        displayName;


    usernameInfoElement.textContent =
        profile.username;


    // ========================================
    // AVATAR
    // ========================================

    if (avatarElement) {

        avatarElement.src =
            profile.avatar_url ||
            "assets/default-avatar.png";

    }


    // ========================================
    // RANK
    // ========================================

    const rankNames = {

        newbie:
            "🌱 Newbie",

        aero_member:
            "💧 Aero Member",

        aero_enthusiast:
            "🌊 Aero Enthusiast",

        aero_veteran:
            "☁️ Aero Veteran",

        aero_legend:
            "💎 Aero Legend"

    };


    const rank =
        rankNames[profile.rank] ||
        "🌱 Newbie";


    if (rankElement) {
        rankElement.textContent =
            rank;
    }

    if (rankInfoElement) {
        rankInfoElement.textContent =
            rank;
    }


    // ========================================
    // ROLE
    // ========================================

    const roleNames = {

        member:
            "Member",

        moderator:
            "Moderator",

        senior_moderator:
            "Senior Moderator",

        administrator:
            "Administrator",

        owner:
            "Owner"

    };


    const role =
        roleNames[profile.role] ||
        "Member";


    if (roleElement) {
        roleElement.textContent =
            role;
    }

    if (roleInfoElement) {
        roleInfoElement.textContent =
            role;
    }


    // ========================================
    // BIO
    // ========================================

    if (bioElement) {

        bioElement.textContent =
            profile.bio ||
            "Welcome to The Aero Forum!";

    }


    // ========================================
    // CREATED DATE
    // ========================================

    if (createdElement) {

        const createdDate =
            new Date(profile.created_at);


        createdElement.textContent =
            createdDate.toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    }


    // ========================================
    // PROFILE ACTION
    // ========================================

    if (actionsElement) {

        actionsElement.innerHTML = `

            <a
                href="settings.html"
                class="profile-action-button"
            >
                ⚙️ Edit Profile
            </a>

        `;

    }

}


// ========================================
// START
// ========================================

setupAuthNavigation();
loadProfilePage();

console.log("🌊 THE AERO FORUM AUTH.JS LOADED");