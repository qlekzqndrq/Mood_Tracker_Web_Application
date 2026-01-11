describe('Automatizare Negative Login', () => {

  it('Negative Login', () => {
    
    cy.visit('http://localhost:5000');

    // 1. Scriem un email corect (robot@test.com)
    cy.get('input[type="email"]').type('robot@test.com'); 

    // 2. Scriem o parola GRESITA intentionat
    cy.get('input[type="password"]').type('parola_aiurea_123');

    // 3. Apasam Log In
    cy.contains('Log In').click();

    // 4. VERIFICARE:
    // a) Nu trebuie sa ajungem pe index.html
    cy.url().should('not.include', 'index.html');

    // b) Trebuie sa ramanem pe login
    cy.url().should('include', 'login');

    // c) OPTIONAL: Daca ai mesaj de eroare pe ecran (ex: "Invalid credentials")
    // cy.contains('Invalid credentials').should('be.visible');
    
  });

});