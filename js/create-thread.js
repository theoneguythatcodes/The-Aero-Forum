import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
    "https://cmferfyrsinjponhuuru.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jvJ7dQqUGe9U3znFapsdKA_4RpwV52Y";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// CATEGORY FROM URL
// ========================================

const params =
    new URLSearchParams(window.location.search);

const categoryId =
    params.get("id");


// ========================================
// ELEMENTS
// ========================================

const form =
    document.getElementById("create-thread-form");

const titleInput =
    document.getElementById("thread-title");

const contentInput =
    document.getElementById("thread-content");

const message =
    document.getElementById("thread-message");

const categoryLocation =
    document.getElementById("category-location");

const cancelLink =
    document.getElementById("cancel-thread");


// ========================================
// LOAD CATEGORY
// ========================================

async function loadCategory() {

    if (!categoryId) {

        categoryLocation.textContent =
            "No category selected.";

        return;
    }


    const {
        data: category,
        error
    } = await supabase
        .from("categories")
        .select("id, name, parent_id")
        .eq("id", Number(categoryId))
        .single();


    if (error || !category) {

        console.error(
            "Category error:",
            error
        );

        categoryLocation.textContent =
            "Category not found.";

        return;
    }


    categoryLocation.textContent =
        `Home → Categories → ${category.name}`;

    cancelLink.href =
        `category.html?id=${category.id}`;
}


// ========================================
// CREATE THREAD
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();


        if (userError || !user) {

            message.textContent =
                "You must be logged in to create a thread.";

            return;
        }


        if (!categoryId) {

            message.textContent =
                "No category selected.";

            return;
        }


        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();


        if (title.length < 3) {

            message.textContent =
                "Thread title must be at least 3 characters.";

            return;
        }


        if (!content) {

            message.textContent =
                "Thread content cannot be empty.";

            return;
        }


        const button =
            form.querySelector(
                "button[type='submit']"
            );


        button.disabled = true;
        button.textContent =
            "Creating thread...";

        message.textContent = "";


        try {

            const {
                data: thread,
                error
            } = await supabase
                .from("threads")
                .insert({

                    category_id:
                        Number(categoryId),

                    author_id:
                        user.id,

                    title,
                    content,

                    featured: false,

                    locked: false

                })
                .select("id")
                .single();


            if (error) {

                console.error(
                    "Thread creation error:",
                    error
                );

                message.textContent =
                    error.message;

                return;
            }


            message.textContent =
                "Thread created! 🌊";


            window.location.href =
                `thread.html?id=${thread.id}`;


        } catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            message.textContent =
                "Something went wrong.";


        } finally {

            button.disabled = false;

            button.textContent =
                "Create Thread 🌊";

        }

    }
);


// ========================================
// START
// ========================================

loadCategory();