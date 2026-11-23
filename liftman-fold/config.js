// Innstillinger for Servicerapport Lift-Man Fold.
// clientId fylles inn etter at appen er registrert i Microsoft Entra (se OPPSETT.md).
// Samme app-registrering som Årskontroll Wall-Man kan brukes (legg til denne adressen som ekstra Redirect URI).
window.LMF_CONFIG = {
  // "Application (client) ID" fra app-registreringen i Entra
  clientId: '6354cbe5-4c94-44d9-b278-245c861ac8e5',
  // Reglo sin Microsoft 365-tenant (domenenavn eller Directory (tenant) ID)
  tenant: 'reglo.no',
  // Tom = appens egen adresse. Må være registrert som Redirect URI (type SPA) i Entra.
  redirectUri: '',

  // SharePoint: dokumentbiblioteket "Delte dokumenter" på RegloAS-området
  driveId: 'b!81tf3UREL0KmoW4jvltpjBnrvdqZDAhMjVgRMZ-PjKfLM5GX3tAlS5mKzxFFbCB1',
  // Mappen Service/Lift/Lift-Man Fold/Kunde
  kundeFolderId: '01EN5RPZPCL67O4X22MRHIJYDCRYJGLJYF',
  kundeFolderLabel: 'Service › Lift › Lift-Man Fold › Kunde'
};
