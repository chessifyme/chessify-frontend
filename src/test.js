function customEncode(data) {
	return btoa(data.split('').map(char => String.fromCharCode(char.charCodeAt(0) + 1)).join(''));
}

function customDecode(data) {
	return atob(data).split('').map(char => String.fromCharCode(char.charCodeAt(0) - 1)).join('');
}

// Example Usage
const originalText = `1. Nf3 d5 2. g3 c5 3. Bg2 Nc6 4. O-O e5 5. d3 Bd6 6. a4 Nge7 7. e4 d4 8. Na3 h6
9. Nc4 Bc7 10. Nh4 g5 11. Nf5 Nxf5 12. exf5 Bxf5 13. Re1 f6 14. a5 Qd7 15. b4
Nxb4 16. a6 b5 17. Nxe5 fxe5 18. Bxa8 O-O 19. Be4 Bxe4 20. Rxe4 Rf6 21. Bd2 Nxa6
22. h4 Qf5 23. Qe2 gxh4 24. Rxh4 Qe6 25. Rxh6 Rxh6 26. Bxh6 Qxh6 27. Qg4+ Kh7
28. Kg2 Qc6+ 29. f3 Qg6 30. Rh1+ Kg7 31. Qd7+ Kf6 32. Rh7 Qg8 33. Qc6+ Kg5 34.
Qh6+ Kf5 35. g4+ 1-0`;
const encodedText = customEncode(originalText);
console.log("Encoded Text:", encodedText);

const decodedText = customDecode(encodedText);
console.log("Decoded Text:", decodedText);
