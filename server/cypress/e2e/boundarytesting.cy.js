describe('Automatizare Boundary Testing', () => {

    it('Verificare wizard si limita de caractere', () => {
        
        cy.visit('http://localhost:5000'); 
        cy.get('input[type="email"]').type('test@moodtracker.com'); 
        cy.get('input[type="password"]').type('123456');
        cy.contains('Log In').click();
        cy.url().should('include', 'index.html');
        cy.wait(2000); 

        cy.get('#logMoodBtn').click({ force: true });
        cy.wait(1000); 

        cy.get('#mood-options > div:nth-child(1)').click({ force: true });
        
        cy.wait(500);

        cy.get('#step-1 button.primary-btn').click({ force: true });
        cy.wait(500);

        cy.get('#tags-container > div:nth-child(1)').click({ force: true });
        
        cy.get('#step-2 button.primary-btn').click({ force: true });
        cy.wait(500);

        const textLung = 'Test '.repeat(100); 
        
        cy.get('#wizard-reflection').type(textLung, { force: true, delay: 0 });

        cy.get('#wizard-reflection').should($textarea => {
            const val = $textarea.val();
            expect(val.length).to.be.at.most(150);
        });

        cy.get('#step-3 button.primary-btn').click({ force: true });
        cy.wait(500);

        cy.get('#sleep-options > div:nth-child(2)').click({ force: true });
        cy.wait(500);

        cy.get('#step-4 button.primary-btn').click({ force: true });

        cy.wait(2000);
        cy.contains('Test Test Test').should('be.visible');

        cy.log('Test reusit! Formularul a fost trimis corect.');
    });
    
});