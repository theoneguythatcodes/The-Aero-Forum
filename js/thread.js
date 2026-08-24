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
// THREAD ID
// ========================================

const params =
    new URLSearchParams(window.location.search);

const threadId =
    params.get("id");


// ========================================
// ELEMENTS
// ========================================

const threadTitle =
    document.getElementById("thread-title");

const threadMeta =
    document.getElementById("thread-meta");

const threadFeatured =
    document.getElementById("thread-featured");

const threadBreadcrumb =
    document.getElementById("thread-breadcrumb");

const originalAuthor =
    document.getElementById("original-author");

const originalAvatar =
    document.getElementById("original-avatar");

const originalRank =
    document.getElementById("original-rank");

const originalContent =
    document.getElementById("original-content");

const originalDate =
    document.getElementById("original-date");

const replyList =
    document.getElementById("reply-list");

const replyForm =
    document.getElementById("reply-form");

const replyContent =
    document.getElementById("reply-content");

const replyMessage =
    document.getElementById("reply-message");


// ========================================
// LOAD THREAD
// ========================================

async function loadThread() {

    if (!threadId) {

        threadTitle.textContent =
            "Thread not found.";

        return;
    }


    const {
        data: thread,
        error
    } = await supabase
        .from("threads")
        .select(`
            id,
            title,
            content,
            featured,
            locked,
            created_at,
            author_id,
            category_id,
            profiles (
                username,
                display_name,
                avatar_url,
                rank
            ),
            categories (
                id,
                name,
                parent_id
            )
        `)
        .eq("id", Number(threadId))
        .single();


    if (error || !thread) {

        console.error(
            "Thread error:",
            error
        );

        threadTitle.textContent =
            "Thread not found.";

        return;
    }


    // ========================================
    // HEADER
    // ========================================

    threadTitle.textContent =
        thread.title;


    if (thread.featured) {

        threadFeatured.textContent =
            "📌 Featured Thread";

    }


    const author =
        thread.profiles?.display_name ||
        thread.profiles?.username ||
        "Unknown user";


    threadMeta.textContent =
        `👤 ${author} · ${formatDate(thread.created_at)}`;


    // ========================================
    // BREADCRUMB
    // ========================================

    if (thread.categories) {

        threadBreadcrumb.innerHTML = `
            Home → Categories →
            <a href="category.html?id=${thread.categories.id}">
                ${escapeHTML(thread.categories.name)}
            </a>
            → ${escapeHTML(thread.title)}
        `;

    }


    // ========================================
    // ORIGINAL POST
    // ========================================

    originalAuthor.textContent =
        author;


    originalAvatar.src =
        thread.profiles?.avatar_url ||
        "assets/default-avatar.png";


    originalRank.textContent =
        getRankName(
            thread.profiles?.rank
        );


    originalContent.textContent =
        thread.content;


    originalDate.textContent =
        formatDate(thread.created_at);


    // ========================================
    // REPLIES
    // ========================================

    await loadReplies(thread.id);


    // ========================================
    // LOCKED
    // ========================================

    if (thread.locked) {

        replyForm.innerHTML = `
            <div class="thread-message">
                🔒 This thread is locked.
            </div>
        `;

        return;
    }

}


// ========================================
// LOAD REPLIES
// ========================================

async function loadReplies(threadId) {

    const {
        data: replies,
        error
    } = await supabase
        .from("posts")
        .select(`
            id,
            content,
            created_at,
            author_id,
            profiles (
                username,
                display_name,
                avatar_url,
                rank
            )
        `)
        .eq("thread_id", threadId)
        .order("created_at", {
            ascending: true
        });


    if (error) {

        console.error(
            "Replies error:",
            error
        );

        replyList.innerHTML = `
            <div class="thread-loading">
                Could not load replies.
            </div>
        `;

        return;
    }


    if (!replies || replies.length === 0) {

        replyList.innerHTML = `
            <div class="thread-loading">
                No replies yet. Be the first! 🌊
            </div>
        `;

        return;
    }


    replyList.innerHTML = "";


    replies.forEach(reply => {

        const post =
            document.createElement("article");

        post.className =
            "forum-post";


        const author =
            reply.profiles?.display_name ||
            reply.profiles?.username ||
            "Unknown user";


        const avatar =
            reply.profiles?.avatar_url ||
            "assets/default-avatar.png";


        post.innerHTML = `
            <aside class="post-author">

                <img
                    src="${escapeHTML(avatar)}"
                    class="post-avatar"
                    alt="Author"
                >

                <strong>
                    ${escapeHTML(author)}
                </strong>

                <span>
                    ${escapeHTML(
                        getRankName(reply.profiles?.rank)
                    )}
                </span>

            </aside>

            <div class="post-content">

                <div class="post-text">
                    ${escapeHTML(reply.content)}
                </div>

                <div class="post-date">
                    ${formatDate(reply.created_at)}
                </div>

            </div>
        `;


        replyList.appendChild(post);

    });

}


// ========================================
// POST REPLY
// ========================================

replyForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();


        if (userError || !user) {

            replyMessage.textContent =
                "You must be logged in to reply.";

            return;
        }


        const content =
            replyContent.value.trim();


        if (!content) {

            replyMessage.textContent =
                "Reply cannot be empty.";

            return;
        }


        const button =
            replyForm.querySelector(
                "button[type='submit']"
            );


        button.disabled = true;

        button.textContent =
            "Posting...";


        try {

            const {
                error
            } = await supabase
                .from("posts")
                .insert({

                    thread_id:
                        Number(threadId),

                    author_id:
                        user.id,

                    content

                });


            if (error) {

                console.error(
                    "Reply error:",
                    error
                );

                replyMessage.textContent =
                    error.message;

                return;
            }


            replyContent.value = "";

            replyMessage.textContent =
                "Reply posted! 🌊";


            await loadReplies(
                Number(threadId)
            );


        } catch (error) {

            console.error(
                "Unexpected reply error:",
                error
            );

            replyMessage.textContent =
                "Something went wrong.";

        } finally {

            button.disabled = false;

            button.textContent =
                "Post Reply 🌊";

        }

    }
);


// ========================================
// HELPERS
// ========================================

function getRankName(rank) {

    const ranks = {

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

    return ranks[rank] || "🌱 Newbie";
}


function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "en-US",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
}


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

loadThread();