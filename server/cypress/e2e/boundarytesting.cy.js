describe('Automatizare Boundary Testing', () => {

    it('Verificare wizard si limita de caractere', () => {
        
        // 1. LOGIN
        cy.visit('http://localhost:5000'); 
        cy.get('input[type="email"]').type('test@moodtracker.com'); 
        cy.get('input[type="password"]').type('123456');
        cy.contains('Log In').click();
        cy.url().should('include', 'index.html');
        cy.wait(2000); 

        // 2. START WIZARD
        // Deschidem fereastra
        cy.get('#logMoodBtn').click({ force: true });
        cy.wait(1000); 

        // --- PASUL 1: MOOD (Aici era problema!) ---
        // In loc sa cautam textul, dam click direct pe primul buton de mood (cel cu Very Happy)
        // Folosim selectorul CSS: #mood-options > div:nth-child(1)
        cy.get('#mood-options > div:nth-child(1)').click({ force: true });
        
        // Asteptam putin sa se inregistreze selectia
        cy.wait(500);

        // Apasam Continue
        cy.get('#step-1 button.primary-btn').click({ force: true });
        cy.wait(500);

        // --- PASUL 2: TAGS ---
        // Selectam primul tag din lista (Joyful)
        cy.get('#tags-container > div:nth-child(1)').click({ force: true });
        
        // Apasam Continue
        cy.get('#step-2 button.primary-btn').click({ force: true });
        cy.wait(500);

        // --- PASUL 3: TEXT LIMITAT ---
        // Generam un text lung
        const textLung = 'Test '.repeat(100); 
        
        // Scriem textul
        cy.get('#wizard-reflection').type(textLung, { force: true, delay: 0 });

        // Verificam limita (optional)
        cy.get('#wizard-reflection').should($textarea => {
            const val = $textarea.val();
            expect(val.length).to.be.at.most(150);
        });

        // Apasam Continue
        cy.get('#step-3 button.primary-btn').click({ force: true });
        cy.wait(500);

        // --- PASUL 4: SOMN ---
        // Selectam a doua optiune de somn (7-8 hours) ca sa fim siguri
        cy.get('#sleep-options > div:nth-child(2)').click({ force: true });
        cy.wait(500);

        // --- FINAL: SUBMIT ---
        // Apasam butonul final
        cy.get('#step-4 button.primary-btn').click({ force: true });

        // --- VERIFICARE ---
        // Acum ar trebui sa mearga, daca serverul primeste mood-ul corect
        cy.wait(2000);
        cy.contains('Test Test Test').should('be.visible');

        cy.log('Test reusit! Formularul a fost trimis corect.');
    });
});