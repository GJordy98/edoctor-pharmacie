/* -------------------------
   PAGE: create_pharmacy.html
   - récupère les champs du formulaire
   - POST /register-officine/
   - stocke l'id (createdOfficineId) dans localStorage puis redirect vers create_user.html
   ------------------------- */
async function createPharmacyFlow() {
    const btn = document.getElementById("btnCreatePharmacy");
    const msg = document.getElementById("ph_msg");

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        clearMessage(msg);

        // Construire le payload exactement comme l'API l'attend
        const payload = {
            adresse: {
                city: document.getElementById("addr_city").value || "",
                rue: document.getElementById("addr_rue").value || "",
                quater: document.getElementById("addr_quater").value || "",
                bp: document.getElementById("addr_bp").value || "",
                longitude: parseFloat(document.getElementById("addr_longitude").value) || null,
                latitude: parseFloat(document.getElementById("addr_latitude").value) || null,
                telephone: document.getElementById("addr_telephone").value || ""
            },
            name: document.getElementById("ph_name").value || "",
            description: document.getElementById("ph_description").value || "",
            telephone: document.getElementById("ph_telephone").value || ""
        };

        // Validation minimale
        if (!payload.name || !payload.adresse.city) {
            showMessage(msg, "Le nom de la pharmacie et la ville sont requis.", "error");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Création en cours...";

        const res = await postJSON(`${API_CONFIG.API_BASE_URL}/register-officine/`, payload);

        btn.disabled = false;
        btn.textContent = "Créer la pharmacie";

        if (res.ok && res.json) {
            // l'API renvoie l'objet de la pharmacie incluant l'id
            const created = res.json;
            // Stocker l'id dans localStorage pour l'utiliser ensuite
            if (created.id) {
                localStorage.setItem("createdOfficineId", created.id);
            }
            showMessage(msg, "Pharmacie créée avec succès ! Redirection...", "success");

            // redirection vers la page de création d'utilisateur après courte pause
            setTimeout(() => {
                window.location.href = "create_user.html";
            }, 900);
        } else {
            // afficher message d'erreur renvoyé par l'API si possible
            showMessage(msg, res.json ? (res.json.detail || JSON.stringify(res.json)) : "Erreur inconnue", "error");
        }
    });
}