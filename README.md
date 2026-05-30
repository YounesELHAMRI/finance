# 🎁 Gestion des Dons - Donation Management System

A comprehensive donation management application built with Next.js 16, Prisma, and SQLite. Track and manage charitable donations with an intuitive interface, detailed statistics, and beautiful charts.

## ✨ Features

- **📊 Dashboard**: Real-time statistics and analytics
  - Total donations overview
  - Monthly donation trends
  - Category-based breakdown
  - Top beneficiaries
  - Recent donations list

- **💰 Donation Management**
  - Create, read, update, and delete donations
  - Filter by category, beneficiary, and date range
  - Search functionality
  - Payment method tracking
  - Receipt management support

- **👥 Beneficiary Management**
  - Manage organizations, individuals, and charities
  - Contact information (email, phone, address)
  - Track donation history per beneficiary
  - Type-based filtering

- **🏷️ Category Management**
  - Organize donations by categories
  - Custom colors and icons
  - Track donations per category
  - Visual category indicators

- **📈 Analytics & Charts**
  - Monthly donation bar charts
  - Category distribution pie charts
  - Year-over-year comparisons
  - Interactive visualizations with Recharts

- **📤 Bank Statement Import**
  - Upload CSV or Excel files
  - Automatic data extraction (date, amount, description)
  - Bulk donation creation
  - Support for multiple date formats (DD/MM/YYYY, DD-MM-YYYY, ISO)
  - Pre-select beneficiary and category for batch import
  - Download example CSV template

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **File Parsing**: PapaParse (CSV), XLSX (Excel)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # .env file is already configured with SQLite
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_APP_NAME="Gestion des Dons"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
finance/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── donations/           # Donation endpoints
│   │   ├── categories/          # Category endpoints
│   │   ├── beneficiaries/       # Beneficiary endpoints
│   │   └── stats/               # Statistics endpoint
│   ├── donations/               # Donations page
│   ├── beneficiaries/           # Beneficiaries page
│   ├── categories/              # Categories page
│   ├── import/                  # Bank statement import page
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Dashboard page
│   └── globals.css              # Global styles
├── lib/                         # Utility libraries
│   ├── prisma.ts               # Prisma client
│   ├── utils.ts                # Helper functions
│   └── validations.ts          # Zod schemas
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── package.json                # Dependencies
```

## 🗄️ Database Schema

### Category
- `id`: Unique identifier
- `name`: Category name (unique)
- `description`: Optional description
- `color`: Hex color for UI
- `icon`: Icon name for UI
- `donations`: Related donations

### Beneficiary
- `id`: Unique identifier
- `name`: Beneficiary name
- `type`: organization | individual | charity
- `email`: Optional email
- `phone`: Optional phone
- `address`: Optional address
- `description`: Optional description
- `donations`: Related donations

### Donation
- `id`: Unique identifier
- `amount`: Donation amount
- `date`: Donation date
- `description`: Optional description
- `notes`: Optional notes
- `receiptUrl`: Optional receipt path
- `paymentMethod`: cash | card | transfer | check
- `isRecurring`: Boolean flag
- `categoryId`: Foreign key to Category
- `beneficiaryId`: Foreign key to Beneficiary

## 🔌 API Endpoints

### Donations
- `GET /api/donations` - List all donations (with filters)
- `POST /api/donations` - Create a new donation
- `GET /api/donations/[id]` - Get a single donation
- `PUT /api/donations/[id]` - Update a donation
- `DELETE /api/donations/[id]` - Delete a donation

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/[id]` - Get a single category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### Beneficiaries
- `GET /api/beneficiaries` - List all beneficiaries (with filters)
- `POST /api/beneficiaries` - Create a new beneficiary
- `GET /api/beneficiaries/[id]` - Get a single beneficiary
- `PUT /api/beneficiaries/[id]` - Update a beneficiary
- `DELETE /api/beneficiaries/[id]` - Delete a beneficiary

### Statistics
- `GET /api/stats?year=2024` - Get donation statistics for a year

### Import
- `POST /api/import` - Import donations from CSV/Excel file
  - Form data: `file` (File), `beneficiaryId` (string), `categoryId` (string)
  - Returns: `{ success: boolean, imported: number, total: number, donations: [] }`

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data

# Linting
npm run lint            # Run ESLint
```

## 🎨 Features in Detail

### Dashboard
- **Statistics Cards**: Total donations, yearly donations, donation count, beneficiary count
- **Monthly Chart**: Bar chart showing donations per month
- **Category Chart**: Pie chart showing distribution by category
- **Top Beneficiaries**: List of top 5 beneficiaries by donation amount
- **Recent Donations**: Latest 5 donations with details

### Donations Page
- **Filtering**: By category, beneficiary, and date range
- **Search**: Full-text search across beneficiaries, categories, and descriptions
- **Table View**: Comprehensive list with all donation details
- **Actions**: Edit and delete donations
- **Summary**: Total count and amount of filtered donations

### Beneficiaries Page
- **Card View**: Visual cards with beneficiary information
- **Type Filtering**: Filter by organization, individual, or charity
- **Contact Info**: Display email, phone, and address
- **Donation Count**: Show number of donations received
- **Actions**: Edit and delete beneficiaries

### Categories Page
- **Card View**: Visual cards with color indicators
- **Color Coding**: Each category has a unique color
- **Donation Count**: Show number of donations per category
- **Actions**: Edit and delete categories

### Import Page
- **File Upload**: Drag-and-drop or click to upload CSV/Excel files
- **Beneficiary Selection**: Choose the beneficiary for all imported donations
- **Category Selection**: Choose the category for all imported donations
- **Validation**: Real-time file format validation
- **Preview**: See imported donations before confirmation
- **Example Template**: Download a sample CSV file
- **Bulk Import**: Import multiple donations at once
- **Error Handling**: Clear error messages for invalid data

## 🌐 Localization

The application is currently in French (fr-FR) with:
- French date formatting
- Euro (EUR) currency formatting
- French labels and messages

## 🔒 Data Validation

All forms use Zod schemas for validation:
- Required fields validation
- Email format validation
- Positive number validation
- Date validation
- Enum validation for types

## 📝 Sample Data

The seed script creates:
- 5 categories (Éducation, Santé, Environnement, Aide humanitaire, Religion)
- 4 beneficiaries (Croix-Rouge, MSF, Mosquée Locale, Association des Étudiants)
- 3 sample donations

## 🚧 Future Enhancements

- [ ] Form modals with react-hook-form for inline editing
- [ ] Receipt upload and storage functionality
- [ ] Export donations to PDF/Excel
- [ ] Email notifications for new donations
- [ ] Recurring donation automation
- [ ] Multi-user support with authentication
- [ ] Advanced reporting and custom date ranges
- [ ] Mobile app
- [ ] PDF bank statement parsing with OCR
- [ ] Automatic beneficiary matching
- [ ] Multi-currency support

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

Made with ❤️ by Bob

---

For questions or support, please open an issue in the repository.
