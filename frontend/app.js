const API = window.location.origin;
// ── AUTH GUARD ────────────────────────────────────────────
const userRaw = localStorage.getItem('sole_user');
const currentUser = userRaw ? JSON.parse(userRaw) : null;

// If not logged in, redirect to login
if (!currentUser) {
    location.href = 'login.html';
}

// If admin tries to access client.html or vice-versa, redirect
const page = location.pathname.split('/').pop();
if (page === 'admin.html' && currentUser && currentUser.role !== 'admin') {
    location.href = 'client.html';
}
if (page === 'client.html' && currentUser && currentUser.role === 'admin') {
    location.href = 'admin.html';
}
if (page === 'client-welcome.html' && currentUser && currentUser.role === 'admin') {
    location.href = 'admin.html';
}

// ── VUE APP ───────────────────────────────────────────────
new Vue({
    el: '#app',
    data: {
        view: 'list',
        currentUser: currentUser || {},
        products: [],
        search: '',
        selectedProduct: null,
        editProduct: null,
        editForm: { name: '', description: '', price: '', image_url: '' },
        form:     { name: '', description: '', price: '', image_url: '' }
    },

    methods: {

        // ── LOGOUT ───────────────────────────────────────
        logout() {
            localStorage.removeItem('sole_user');
            location.href = 'login.html';
        },

        // ── ADD ──────────────────────────────────────────
        addProduct() {
            fetch(API + '/add_product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.form)
            })
            .then(res => res.json())
            .then(() => {
                this.form = { name: '', description: '', price: '', image_url: '' };
                return fetch(API + '/products');
            })
            .then(res => res.json())
            .then(data => {
                this.products = data;
                this.view = 'list';
                this.showToast('✓ Product added to catalog');
            });
        },

        // ── READ ─────────────────────────────────────────
        fetchProducts() {
            fetch(API + '/products')
                .then(res => res.json())
                .then(data => { this.products = data; });
        },

        searchProducts() {
            $.get(`${API}/search?q=${this.search}`, (data) => {
                this.products = data;
            });
        },

        // ── VIEW MODAL ────────────────────────────────────
        openProduct(product) {
            this.selectedProduct = product;
            document.body.style.overflow = 'hidden';
        },
        closeProduct() {
            this.selectedProduct = null;
            document.body.style.overflow = '';
        },

        // ── EDIT MODAL ────────────────────────────────────
        openEdit(product) {
            this.editProduct = product;
            this.editForm = { name: product.name, description: product.description, price: product.price, image_url: product.image_url };
            document.body.style.overflow = 'hidden';
        },
        closeEdit() {
            this.editProduct = null;
            document.body.style.overflow = '';
        },

        // ── UPDATE ────────────────────────────────────────
        updateProduct() {
            fetch(`${API}/update_product/${this.editProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.editForm)
            })
            .then(res => res.json())
            .then(() => {
                this.showToast('✏️ Product updated successfully');
                this.closeEdit();
                this.fetchProducts();
            });
        },

        // ── DELETE ────────────────────────────────────────
        deleteProduct(id) {
            if (confirm('Are you sure you want to delete this product?')) {
                fetch(`${API}/delete_product/${id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        this.showToast('🗑 Product deleted');
                        this.fetchProducts();
                    });
            }
        },

        // ── FORM / MODAL TILT ─────────────────────────────
        tiltForm(event) {
            const el     = event.currentTarget;
            const rect   = el.getBoundingClientRect();
            const x      = event.clientX - rect.left;
            const y      = event.clientY - rect.top;
            const cx     = rect.width  / 2;
            const cy     = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -6;
            const rotateY = ((x - cx) / cx) *  6;
            el.style.transform  = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            el.style.transition = 'transform 0.1s ease';
            el.style.boxShadow  = `${-rotateY * 2}px ${rotateX * 2}px 50px rgba(13,51,64,0.22)`;
        },

        resetForm(event) {
            const el = event.currentTarget;
            el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
            el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s';
            el.style.boxShadow  = '';
        },

        // ── CURSOR TILT ───────────────────────────────
        initTiltEffect() {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect   = card.getBoundingClientRect();
                    const x      = e.clientX - rect.left;
                    const y      = e.clientY - rect.top;
                    const cx     = rect.width  / 2;
                    const cy     = rect.height / 2;
                    const rotateX = ((y - cy) / cy) * -16;  // max 8deg
                    const rotateY = ((x - cx) / cx) *  16;
                    card.style.transform  = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
                    card.style.transition = 'transform 0.1s ease';

                    // move inner shine with cursor
                    const shine = card.querySelector('.card-shine');
                    if (shine) {
                        shine.style.left    = `${x}px`;
                        shine.style.top     = `${y}px`;
                        shine.style.opacity = '1';
                    }
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
                    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                    const shine = card.querySelector('.card-shine');
                    if (shine) shine.style.opacity = '0';
                });
            });
        },
        // ── IMAGE ZOOM ────────────────────────────────────
        zoomImage(event) {
            const wrap = event.currentTarget;
            const img  = wrap.querySelector('img');
            const rect = wrap.getBoundingClientRect();
            img.style.transformOrigin = `${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`;
            img.style.transform  = 'scale(2)';
            img.style.transition = 'transform 0.1s ease';
        },
        resetZoom(event) {
            const img = event.currentTarget.querySelector('img');
            img.style.transform  = 'scale(1)';
            img.style.transformOrigin = 'center center';
            img.style.transition = 'transform 0.4s ease';
        },

        // ── SCROLL REVEAL ─────────────────────────────────
        initScrollAnimation() {
            if (this._scrollObserver) this._scrollObserver.disconnect();
            const DELAY = 100;
            const buildRows = () => {
                const cards = Array.from(document.querySelectorAll('.card'));
                const rowMap = {};
                cards.forEach(card => { const top = card.offsetTop; if (!rowMap[top]) rowMap[top] = []; rowMap[top].push(card); });
                return Object.values(rowMap);
            };
            const rows = buildRows();
            rows.forEach(row => row.forEach(card => { card.style.transition = 'none'; card.style.opacity = '0'; card.style.transform = 'translateY(40px) scale(0.96)'; }));
            this._scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const rows2 = buildRows();
                    const myRow = rows2.find(r => r.includes(entry.target));
                    if (!myRow) return;
                    const pos = myRow.indexOf(entry.target);
                    const len = myRow.length;
                    if (entry.isIntersecting) {
                        const d = pos * DELAY;
                        entry.target.style.transition = `opacity .6s cubic-bezier(.16,1,.3,1) ${d}ms, transform .6s cubic-bezier(.16,1,.3,1) ${d}ms`;
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    } else {
                        const d = ((len - 1) - pos) * DELAY;
                        entry.target.style.transition = `opacity .5s cubic-bezier(.16,1,.3,1) ${d}ms, transform .5s cubic-bezier(.16,1,.3,1) ${d}ms`;
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px) scale(0.96)';
                    }
                });
            }, { threshold: 0.15 });
            rows.forEach(row => row.forEach(card => this._scrollObserver.observe(card)));
        },

        // ── TOAST ─────────────────────────────────────────
        showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    },

    mounted() {
        this.fetchProducts();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { this.closeProduct(); this.closeEdit(); }
        });

        this.$watch('products', () => {
            this.$nextTick(() => { this.initScrollAnimation(); this.initTiltEffect(); });
        });

        this.$watch('view', (val) => {
            if (val === 'list') {
                this.$nextTick(() => { this.initScrollAnimation(); this.initTiltEffect(); });
            }
        });
    }
});
