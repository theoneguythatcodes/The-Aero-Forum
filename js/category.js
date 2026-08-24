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
// GET CATEGORY FROM URL
// ========================================

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("id");

const createThreadButton =
    document.getElementById(
        "create-thread-button"
    );

if (createThreadButton) {

    createThreadButton.addEventListener(
        "click",
        () => {

            window.location.href =
                `create-thread.html?id=${category.id}`;

        }
    );

}

// ========================================
// ELEMENTS
// ========================================

const categoryName =
    document.getElementById("category-name");

const categoryDescription =
    document.getElementById("category-description");

const categoryIcon =
    document.getElementById("category-icon");

const categoryBreadcrumb =
    document.getElementById("category-breadcrumb");

const subcategories =
    document.getElementById("subcategories");

const threadList =
    document.getElementById("thread-list");


// ========================================
// LOAD CATEGORY
// ========================================

async function loadCategory() {

    if (!categoryId) {
        showCategoryError();
        return;
    }

    let query;


    // Numeric ID
    if (/^\d+$/.test(categoryId)) {

        query = supabase
            .from("categories")
            .select(`
                id,
                name,
                description,
                icon,
                parent_id
            `)
            .eq("id", Number(categoryId))
            .single();

    }

    // Text / slug-like ID
    else {

        const categorySearch =
            categoryId.replaceAll("-", " ");

        query = supabase
            .from("categories")
            .select(`
                id,
                name,
                description,
                icon,
                parent_id
            `)
            .ilike("name", categorySearch)
            .single();
    }


    const {
        data: category,
        error
    } = await query;


    if (error || !category) {

        console.error(
            "Category error:",
            error
        );

        showCategoryError();

        return;
    }


    // ========================================
    // BASIC INFORMATION
    // ========================================

    categoryName.textContent =
        category.name;

    categoryDescription.textContent =
        category.description || "";

    categoryIcon.textContent =
        category.icon || "📁";


    // ========================================
    // BREADCRUMB
    // ========================================

    if (category.parent_id) {

        const {
            data: parent,
            error: parentError
        } = await supabase
            .from("categories")
            .select("id, name")
            .eq("id", category.parent_id)
            .single();


        if (!parentError && parent) {

            categoryBreadcrumb.textContent =
                `Home → Categories → ${parent.name} → ${category.name}`;

        }
        else {

            categoryBreadcrumb.textContent =
                `Home → Categories → ${category.name}`;

        }

    }
    else {

        categoryBreadcrumb.textContent =
            `Home → Categories → ${category.name}`;

    }


    // ========================================
    // LOAD SUBCATEGORIES
    // ========================================

    await loadSubcategories(category.id);


    // ========================================
    // LOAD THREADS
    // ========================================

    await loadThreads(category.id);
    const createThreadButton =
    document.getElementById("create-thread-button");

    if (createThreadButton) {

        createThreadButton.addEventListener("click", () => {

            window.location.href =
                `create-thread.html?id=${category.id}`;

    });

}
}


// ========================================
// ERROR
// ========================================

function showCategoryError() {

    categoryName.textContent =
        "Category not found";

    categoryDescription.textContent =
        "This category does not exist.";

    categoryIcon.textContent =
        "❌";

    categoryBreadcrumb.textContent =
        "Home → Categories";

    subcategories.innerHTML = "";

    threadList.innerHTML = "";

}


// ========================================
// SUBCATEGORIES
// ========================================

async function loadSubcategories(parentId) {

    subcategories.innerHTML = "";

    const {
        data,
        error
    } = await supabase
        .from("categories")
        .select(`
            id,
            name,
            description,
            icon
        `)
        .eq("parent_id", parentId)
        .order("name");


    if (error) {

        console.error(
            "Subcategory error:",
            error
        );

        subcategories.innerHTML = `
            <p>
                Could not load subcategories.
            </p>
        `;

        return;
    }


    if (!data || data.length === 0) {

        subcategories.innerHTML = `
            <p>
                No subcategories yet.
            </p>
        `;

        return;
    }


    data.forEach(category => {

        const link =
            document.createElement("a");

        link.className =
            "subcategory-card";

        link.href =
            `category.html?id=${category.id}`;


        link.innerHTML = `
            <span class="subcategory-icon">
                ${escapeHTML(category.icon || "📁")}
            </span>

            <span class="subcategory-name">
                ${escapeHTML(category.name)}
            </span>
        `;


        subcategories.appendChild(link);

    });

}


// ========================================
// THREADS
// ========================================

async function loadThreads(categoryId) {

    threadList.innerHTML = `
        <div class="thread-loading">
            Loading discussions...
        </div>
    `;


    const {
        data,
        error
    } = await supabase
        .from("threads")
        .select(`
            id,
            title,
            content,
            created_at,
            featured,
            author_id,
            profiles (
                username,
                rank
            )
        `)
        .eq("category_id", categoryId)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Thread error:",
            error
        );

        threadList.innerHTML = `
            <div class="thread-loading">
                Could not load discussions.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        threadList.innerHTML = `
            <div class="thread-loading">
                No discussions yet. 🌱
            </div>
        `;

        return;
    }


    threadList.innerHTML = "";


    data.forEach(thread => {

        const article =
            document.createElement("a");

        article.className =
            "thread-card";

        article.href =
            `thread.html?id=${thread.id}`;


        const author =
            thread.profiles?.username ||
            "Unknown user";


        const featured =
            thread.featured
                ? "📌 "
                : "";


        article.innerHTML = `
            <div class="thread-title">
                ${featured}${escapeHTML(thread.title)}
            </div>

            <div class="thread-meta">
                👤 ${escapeHTML(author)}
            </div>
        `;


        threadList.appendChild(article);

    });

}


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
// START
// ========================================

loadCategory();