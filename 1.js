function totalInvestmentAfterTwoYears() {
    // Modal awal
    const startInvestment = 1000000000; // 1 miliar

    // Pembagian investasi
    const deposito = 350000000; // 350 juta di deposito
    const obligasi = 650000000 * 0.3; // 30% dari 650 juta ke obligasi
    const sahamA = 650000000 * 0.35; // 35% dari 650 juta ke saham A
    const sahamB = 650000000 * 0.35; // Sisanya (35%) ke saham B

    // Persentase keuntungan per tahun
    const depositoRate = 3.5 / 100;
    const obligasiRate = 13 / 100;
    const sahamARate = 14.5 / 100;
    const sahamBRate = 12.5 / 100;

    // Menghitung total setelah dua tahun dengan bunga majemuk
    const totalDeposito = deposito * Math.pow(1 + depositoRate, 2);
    const totalObligasi = obligasi * Math.pow(1 + obligasiRate, 2);
    const totalSahamA = sahamA * Math.pow(1 + sahamARate, 2);
    const totalSahamB = sahamB * Math.pow(1 + sahamBRate, 2);

    // Total keseluruhan
    const totalInvestment = totalDeposito + totalObligasi + totalSahamA + totalSahamB;

    // Menampilkan hasil
    console.log(`Total uang investor setelah dua tahun adalah: Rp${totalInvestment}`);
}

// Memanggil fungsi
totalInvestmentAfterTwoYears();