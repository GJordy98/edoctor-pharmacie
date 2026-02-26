(function () {
    "use strict"

    // Configuration de l'API
    const API_BASE_URL = 'https://edoctor-api.onrender.com/api/v1';
    let grid;
    let productsData = [];

    // Fonction pour récupérer l'ID de la pharmacie depuis localStorage
    function getPharmacyId() {
        const officineData = localStorage.getItem('officine');
        if (officineData) {
            try {
                const officine = JSON.parse(officineData);
                return officine.id || officine.officine_id;
            } catch (e) {
                console.error('Error parsing officine data:', e);
            }
        }
        return null;
    }

    // Fonction pour récupérer le token d'authentification
    function getAuthToken() {
        return localStorage.getItem('token');
    }

    // Fonction pour charger les produits depuis le backend
    async function loadProducts() {
        const pharmacyId = getPharmacyId();
        const token = getAuthToken();

        if (!pharmacyId) {
            showError('ID de pharmacie non trouvé. Veuillez vous reconnecter.');
            return;
        }

        if (!token) {
            showError('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
            return;
        }

        try {
            showLoading();

            const response = await fetch(`${API_BASE_URL}/officine/${pharmacyId}/list-officine-products/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Transformer les données du backend en format pour gridjs
            productsData = transformProductsData(data);
            
            // Initialiser ou mettre à jour le tableau
            if (grid) {
                grid.updateConfig({
                    data: productsData
                }).forceRender();
            } else {
                initializeGrid();
            }

            hideLoading();
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            showError('Erreur lors du chargement des produits: ' + error.message);
        }
    }

    // Transformer les données du backend au format gridjs
    function transformProductsData(products) {
        if (!Array.isArray(products)) {
            products = products.results || products.data || [];
        }

        return products.map(product => {
            return [
                product.id || '',                                    // 0: ID
                product.name || 'Sans nom',                          // 1: Nom
                product.dci || '',                                   // 2: DCI
                product.dosage || '',                                // 3: Dosage
                product.category_detail?.name || 'Non catégorisé',  // 4: Catégorie
                product.galenic_detail?.name || '',                 // 5: Forme galénique
                product.unit_base_detail?.label || '',              // 6: Unité de base
                product.created_at ? new Date(product.created_at).toLocaleDateString('fr-FR') : '', // 7: Date
                product // 8: Objet complet pour référence
            ];
        });
    }

    // Initialiser le tableau gridjs
    function initializeGrid() {
        grid = new gridjs.Grid({
            columns: [
                {
                    name: '#',
                    width: '50px',
                    formatter: (_, row) => gridjs.html(
                        `<input class="form-check-input" type="checkbox" id="product-${row.cells[0].data}" value="" aria-label="...">`
                    )
                },
                {
                    name: 'Nom du Produit',
                    width: '250px',
                    formatter: (_, row) => gridjs.html(`
                        <div class="d-flex align-items-center gap-2">
                            <div>
                                <span class="d-block fw-semibold">${row.cells[1].data}</span>
                                ${row.cells[2].data ? `<span class="badge bg-light text-dark fw-normal fs-11">${row.cells[2].data}</span>` : ''}
                            </div>
                        </div>
                    `)
                },
                {
                    name: 'Dosage',
                    width: '120px',
                    formatter: (_, row) => row.cells[3].data || '—'
                },
                {
                    name: 'Catégorie',
                    width: '150px',
                    formatter: (_, row) => gridjs.html(
                        `<span class="badge bg-primary-transparent text-primary">${row.cells[4].data}</span>`
                    )
                },
                {
                    name: 'Forme Galénique',
                    width: '150px',
                    formatter: (_, row) => row.cells[5].data || '—'
                },
                {
                    name: 'Unité de base',
                    width: '120px',
                    formatter: (_, row) => gridjs.html(
                        row.cells[6].data ? `<span class="badge bg-secondary-transparent text-secondary">${row.cells[6].data}</span>` : '—'
                    )
                },
                {
                    name: 'Date d\'ajout',
                    width: '120px',
                    formatter: (_, row) => row.cells[7].data || '—'
                },
                {
                    name: 'Actions',
                    width: '100px',
                    formatter: (_, row) => gridjs.html(`
                        <div class="hstack gap-2 fs-15">
                            <a href="/products/${row.cells[0].data}/edit" class="btn btn-icon btn-sm btn-info-transparent rounded-pill" title="Modifier">
                                <i class="ri-edit-line"></i>
                            </a>
                            <button class="btn btn-icon btn-sm btn-danger-transparent rounded-pill btn-delete" data-id="${row.cells[0].data}" title="Supprimer">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    `)
                }
            ],
            data: productsData,
            pagination: {
                enabled: true,
                limit: 10
            },
            search: false,
            sort: true,
            className: {
                table: 'table table-hover text-nowrap'
            }
        }).render(document.getElementById('product-table'));
    }

    // Afficher le chargement
    function showLoading() {
        const container = document.getElementById('product-table');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="text-muted mt-3 mb-0">Chargement des produits...</p>
                </div>
            `;
        }
    }

    // Masquer le chargement
    function hideLoading() {
        // Le grid remplacera automatiquement le contenu
    }

    // Afficher une erreur
    function showError(message) {
        const container = document.getElementById('product-table');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center gap-2 m-3" role="alert">
                    <i class="ri-error-warning-line fs-18"></i>
                    <div>
                        <strong>Erreur :</strong> ${message}
                        <button class="btn btn-sm btn-outline-danger ms-3" onclick="location.reload()">
                            <i class="ri-refresh-line me-1"></i>Réessayer
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Fonction pour supprimer un produit
    async function deleteProduct(productId) {
        const token = getAuthToken();
        
        if (!token) {
            alert('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Recharger les produits
            await loadProducts();
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            alert('Erreur lors de la suppression du produit: ' + error.message);
            return false;
        }
    }

    // Gestionnaire de suppression avec confirmation
    document.addEventListener('click', function (e) {
        if (e.target && (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete'))) {
            const button = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
            const productId = button.getAttribute('data-id');
            
            if (productId && confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                deleteProduct(productId);
            }
        }
    });

    // Fonction pour appliquer les filtres (si vous avez des filtres dans votre HTML)
    function applyFilters() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        if (!searchInput || !grid) return;

        const searchValue = searchInput.value.toLowerCase();
        const categoryValue = categoryFilter ? categoryFilter.value : 'all';

        const filteredData = productsData.filter(row => {
            const productName = row[1].toLowerCase();
            const productDci = row[2].toLowerCase();
            const productCategory = row[4].toLowerCase();

            const matchesSearch = !searchValue || 
                productName.includes(searchValue) || 
                productDci.includes(searchValue);

            const matchesCategory = categoryValue === 'all' || 
                productCategory === categoryValue.toLowerCase();

            return matchesSearch && matchesCategory;
        });

        grid.updateConfig({
            data: filteredData
        }).forceRender();
    }

    // Attacher les événements de filtrage si les éléments existent
    window.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const refreshBtn = document.getElementById('refresh-products');

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadProducts);
        }
    });

    // Charger les produits au chargement de la page
    loadProducts();

})();