NOVA E-COMMERCE APPLICATION
============================

File Structure:
---------------
your-project-folder/
├── index.html          - Main HTML structure
├── css/
│   └── style.css       - All Apple-inspired styles
├── js/
│   ├── data.js         - Product, bond, and promo code database
│   └── app.js          - Application logic (cart, filters, UI)
└── README.txt          - This file

How to Run:
-----------
1. Create the folder structure as shown above
2. Copy each file to its correct location
3. Open index.html in any modern web browser
4. No server required - works locally

Features:
---------
✓ Apple-inspired modern design with rounded corners and clean typography
✓ Fully responsive (mobile, tablet, desktop)
✓ Filipino street food products (Kwek kwek, Fishball, etc.)
✓ Category filtering (Street Snacks, Heavy Snack, Drinks & Desserts)
✓ Search functionality
✓ Shopping cart with add/remove/quantity controls
✓ Cart sidebar drawer
✓ Local storage persistence (cart, credit, investments)
✓ Toast notifications
✓ Bond investment platform with interactive charts
✓ Code redemption system with random codes (1, 2, 5, 10, 50, 100 peso credits)
✓ Credit system that applies to purchases
✓ Account icon showing credit balance
✓ Newsletter subscription
✓ FAQ accordion
✓ Contact form

Browser Support:
----------------
Chrome, Firefox, Safari, Edge (latest versions)

Technologies Used:
------------------
- HTML5
- CSS3 (Flexbox, Grid, Animations, Apple-inspired design)
- Vanilla JavaScript (ES6+)
- Chart.js for investment charts
- Font Awesome Icons
- Google Fonts (Inter)


Push to GitHub
cd C:\Users\ASUS\OneDrive\Ecommerce\nova-ecommerce
git add css/style.css
git commit -m "Fixed login with phone number format handling"
git push


Redeploy to Vercel
cd C:\Users\ASUS\OneDrive\Ecommerce\nova-ecommerce
git add .
git commit -m "Updated login to handle multiple phone formats"
git push
vercel --prod