describe('Automatizare Log Mood', () => {

  it('Adaugare Mood nou (Flux Wizard Complet)', () => {
    
    // --- 1. LOGIN ---
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.get('input[type="password"]').type('123456');
    cy.contains('Log In').click();
    cy.url().should('include', 'index.html');
    cy.wait(2000); 

    // --- 2. DESCHIDE FORMULARUL ---
    // Apasam butonul "Log today's mood" din header
    cy.get('#logMoodBtn').click({ force: true });
    cy.wait(1000); // Asteptam sa apara fereastra

    // --- 3. PASUL 1: MOOD ---
    // Selectam primul emoji (Very Happy) - e mai sigur cu nth-child
    cy.get('#mood-options > div:nth-child(1)').click({ force: true });
    
    // Apasam Continue (butonul din Step 1)
    cy.get('#step-1 button.primary-btn').click({ force: true });
    cy.wait(500);

    // --- 4. PASUL 2: TAG-uri ---
    // Selectam un tag (primul din lista, ex: Joyful)
    cy.get('#tags-container > div:nth-child(1)').click({ force: true });

    // Apasam Continue (butonul din Step 2)
    cy.get('#step-2 button.primary-btn').click({ force: true });
    cy.wait(500);

    // --- 5. PASUL 3: TEXT (Reflection) ---
    // Generam textul unic ca sa fim siguri ca il recunoastem
    const mesajUnic = 'Jurnal Automat ' + Date.now();

    // Scriem mesajul in casuta corecta (#wizard-reflection)
    cy.get('#wizard-reflection').type(mesajUnic, { force: true });

    // Apasam Continue (butonul din Step 3)
    cy.get('#step-3 button.primary-btn').click({ force: true });
    cy.wait(500);

    // --- 6. PASUL 4: SOMN ---
    // Selectam orele de somn (a doua optiune, 7-8 hours)
    cy.get('#sleep-options > div:nth-child(2)').click({ force: true });

    // --- 7. FINALIZARE (SUBMIT) ---
    // Apasam butonul final din Step 4
    cy.get('#step-4 button.primary-btn').click({ force: true });

    // --- 8. VERIFICARE ---
    cy.wait(2000); // Asteptam sa se salveze in baza de date
    
    // Verificam daca textul nostru unic a aparut pe ecran
    cy.contains(mesajUnic).should('be.visible');

    cy.log('Succes! Mood-ul a fost adaugat prin toti pasii wizard-ului.');
  });
});