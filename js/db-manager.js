const DB_NAME = 'childguard_reports';

export const db = {
    getAll() {
        const data = localStorage.getItem(DB_NAME);
        return data ? JSON.parse(data) : [];
    },

    save(report) {
        const reports = this.getAll();
        const newReport = {
            ...report,
            id: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            timestamp: new Date().toLocaleString()
        };
        reports.unshift(newReport);
        localStorage.setItem(DB_NAME, JSON.stringify(reports));
        return newReport;
    },

     
    generateDemoData() {
        const names = ["Chinedu Okafor", "Fatima Yusuf", "Emeka Obi", "Amina Bello", "Tunde Adenuga", "Ngozi Adichie", "Oluwaseun Ajayi", "Zainab Musa", "Kelechi Iheanacho", "Bisi Akande", "Ifeanyi Ugwu", "Halima Idris", "Damilola Ade", "Uche Jombo", "Sani Abacha", "Funke Akindele", "Segun Arinze", "Patience Ozokwor", "Genevieve Nnaji", "Mikel Obi"];
        const locations = ["14 Nnobi Street, Enugu", "22 Gwarinpa, Abuja", "10 Ajah, Lagos", "5 Sabon Gari, Kano", "18 Ring Road, Ibadan"];
        const statuses = ["Pending", "Investigating", "Resolved"];

        const demoReports = names.map((name, i) => ({
            id: 'DEMO-' + (1000 + i),
            name: name,
            age: Math.floor(Math.random() * 12) + 3,
            location: locations[Math.floor(Math.random() * locations.length)],
            description: "This is a pre-generated demo report for testing the administrative interface and dashboard functionality.",
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timestamp: new Date(Date.now() - i * 3600000).toLocaleString()
        }));

        localStorage.setItem(DB_NAME, JSON.stringify(demoReports));
        return demoReports;
    },

    // Export current data to a physical .json file
    exportToJSON() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `childguard_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    // Import data from a file back into localStorage
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    localStorage.setItem(DB_NAME, JSON.stringify(data));
                    resolve(data);
                } catch (err) {
                    reject("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        });
    }
};