function cetakPola(n) {
    for (let i = 0; i < n; i++) {
        let row = "";
        
        // Menambahkan spasi awal
        for (let j = 0; j < i; j++) {
            row += " ";
        }
        
        // Menambahkan karakter '#' dan '+'
        for (let k = 0; k < 2 * (n - i) - 1; k++) {
            if (i % 2 === 0) {
                // Baris genap, dimulai dengan '#'
                row += k % 2 === 0 ? "#" : "+";
            } else {
                // Baris ganjil, dimulai dengan '+'
                row += "+";
            }
        }
        
        console.log(row);
    }
}

// Memanggil fungsi dengan input 5
cetakPola(5);