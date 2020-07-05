// Recibe fecha en formato "DD/MM/AAAA hh:mm" y devuelve formato Date
exports.formatForNode = stringDate => {
  
  // Invertimos el dia y el mes
  stringDate = `${stringDate.substring(3,5)}/${stringDate.substring(0,2)}/${stringDate.substring(6,10)} ${stringDate.substring(11)}`;
  
  return new Date(stringDate);
};