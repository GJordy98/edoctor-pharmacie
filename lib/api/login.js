
/* -------------------------
   PAGE: login.html
   - POST /login/
   - en cas de succès stocke tokens & account dans localStorage
   - redirige vers dashboard.html
   ------------------------- */
async function loginFlow() {
    const btn = document.getElementById("btnLogin");
    const msg = document.getElementById("login_msg");

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        clearMessage(msg);

        const payload = {
            telephone: document.getElementById("login_telephone").value || "",
            password: document.getElementById("login_password").value || ""
        };

        if (!payload.telephone || !payload.password) {
            showMessage(msg, "Téléphone et mot de passe requis.", "error");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Connexion...";

        const res = await postJSON(`${CONFIG.API_BASE_URL}/login/`, payload);

        btn.disabled = false;
        btn.textContent = "Se connecter";

        if (res.ok && res.json) {
            const data = res.json;
            // Attendu : data.access, data.refresh, data.account, data.officine
            if (data.access && data.refresh && data.account) {
                // Stocker dans localStorage pour sessions futures
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);
                localStorage.setItem("account", JSON.stringify(data.account));
                localStorage.setItem("officine", JSON.stringify(data.officine || null));

                showMessage(msg, "Connexion réussie ! Redirection vers le dashboard...", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);
            } else {
                showMessage(msg, "Réponse inattendue du serveur: " + JSON.stringify(data), "error");
            }
        } else {
            // si API renvoie message d'erreur détaillé, l'afficher
            showMessage(msg, res.json ? (res.json.detail || JSON.stringify(res.json)) : "Erreur inconnue", "error");
        }
    });
}