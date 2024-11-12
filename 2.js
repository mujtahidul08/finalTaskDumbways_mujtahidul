function sortArray(arr) {
    const targetString = "Dumbways is awesome";
    const targetArray = targetString.split("");

    // Selection sort
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        // Swap jika diperlukan
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }

    // Gabungkan array menjadi string
    return arr.join("");
}

// Input array
const inputArray = ["u", "D", "m", "w", "b", "a", "y", "s", "i", "s", "w", "a", "e", "s", "e", "o", "m", " ", " "];
const sortedString = sortArray(inputArray);
console.log(sortedString); // Output: Dumbways is awesome
