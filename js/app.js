const DB_NAME = 'childguard_reports';

const dbManager = {
    // Retrieves all records from browser memory
    getAll: () => JSON.parse(localStorage.getItem(DB_NAME) || '[]'),
    
    // Saves a single new report
    save: (report) => {
        const reports = dbManager.getAll();
        const newReport = {
            ...report,
            // Creates a unique Case ID (e.g., CASE-X9J2K1)
            id: 'CASE-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            timestamp: new Date().toISOString()
        };
        reports.unshift(newReport);
        localStorage.setItem(DB_NAME, JSON.stringify(reports));
        return newReport;
    },

    // Updates status of an existing case
    update: (id, status) => {
        const reports = dbManager.getAll().map(r => r.id === id ? { ...r, status } : r);
        localStorage.setItem(DB_NAME, JSON.stringify(reports));
    },

    // Seeds the database with mock Nigerian data for the demo
    generateDemo: () => {
        const demoData = Array.from({ length: 20 }).map((_, i) => ({
            id: 'REF-' + (2000 + i),
            name: ["Adaobi Chukwu", "Tunde Akinde", "Musa Ibrahim", "Kelechi Onyema", "Fatima Yusuf", "Zainab Bello", "Emeka Obi", "Chinedu Eze"][i % 8],
            age: Math.floor(Math.random() * 12) + 3,
            location: ["Enugu North", "Ikeja, Lagos", "Wuse 2, Abuja", "Sabon Gari, Kano", "Ibadan South"][i % 5],
            description: "A detailed report of physical neglect and lack of supervision observed over the last 3 weeks in the specified residential area.",
            status: ["Pending", "Investigating", "Resolved"][Math.floor(Math.random() * 3)],
            timestamp: new Date().toISOString()
        }));
        localStorage.setItem(DB_NAME, JSON.stringify(demoData));
        return demoData;
    }
};

document.addEventListener('alpine:init', () => {
    Alpine.data('appState', () => ({
        page: 'home',
        isLoggedIn: false,
        viewModal: false,
        searchQuery: '',
        reports: [],
        selectedCase: {},
        newReport: { name: '', age: '', location: '', description: '', status: 'Pending' },

        init() {
            // Load data immediately on page load
            this.reports = dbManager.getAll();
        },

        // Filters reports based on the search bar input
        get filteredReports() {
            if (!this.searchQuery) return this.reports;
            return this.reports.filter(r => 
                r.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                r.location.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },

        // Handles the browser print command for the Case File
        printCase() {
            this.$nextTick(() => {
                window.print();
            });
        },

        // Calculates percentage for the dashboard bars
        getStatusStats(status) {
            if (this.reports.length === 0) return 0;
            const count = this.reports.filter(r => r.status === status).length;
            return Math.round((count / this.reports.length) * 100);
        },

        // Submits the public reporting form
        submitForm() {
            dbManager.save(this.newReport);
            this.reports = dbManager.getAll();
            alert("Success: Your report has been submitted to the database.");
            this.page = 'home';
            this.newReport = { name: '', age: '', location: '', description: '', status: 'Pending' };
        },

        // Simple auth for the demo
        handleLogin() {
            this.isLoggedIn = true;
            this.page = 'dashboard';
            this.reports = dbManager.getAll();
        },

        logout() {
            this.isLoggedIn = false;
            this.page = 'home';
        },

        openCase(report) {
            this.selectedCase = { ...report };
            this.viewModal = true;
        },

        updateCaseStatus() {
            dbManager.update(this.selectedCase.id, this.selectedCase.status);
            this.reports = dbManager.getAll();
        },

        // Maps status to Tailwind/CSS classes for colors
        getStatusClass(status) {
            return {
                'bg-amber-100 text-amber-700': status === 'Pending',
                'bg-indigo-100 text-indigo-700': status === 'Investigating',
                'bg-green-100 text-green-700': status === 'Resolved'
            };
        },

        // SEED DATA: Populates local storage with mock data
        generateDemo() {
            this.reports = dbManager.generateDemo();
            alert("Database seeded with 20 demo records.");
        },

        // EXPORT: Downloads LocalStorage content as a .json file
        exportData() {
            const blob = new Blob([JSON.stringify(this.reports, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ChildGuard_Export_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url); // Clean up memory
        },

        // IMPORT: Overwrites LocalStorage with a selected .json file
        importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        localStorage.setItem(DB_NAME, JSON.stringify(data));
                        this.reports = data;
                        alert("Database successfully restored from JSON file.");
                    } else {
                        throw new Error("Invalid format");
                    }
                } catch (err) {
                    alert("Error: The file provided is not a valid ChildGuard JSON export.");
                }
            };
            reader.readAsText(file);
        }
    }));
});
