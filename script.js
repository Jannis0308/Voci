let vocabList = [];

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Datei aus.');
        return;
    }

    if (!file.name.endsWith('.voci')) {
        alert('Bitte lade eine Datei mit der Endung .voci hoch.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Fehler beim Upload: ${errorText}`);
            return;
        }

        const result = await response.json();
        const output = document.getElementById('output');
        output.innerHTML = `<p>${result.message}</p>`;

        vocabList = result.vocab; // Speichert die Vokabeln für das Quiz

        // Zeige die hochgeladenen Vokabeln
        vocabList.forEach(v => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<p>${v.question} - ${v.answer}</p>`;
            output.appendChild(card);
        });

        alert('Die Datei wurde erfolgreich hochgeladen und gespeichert!');
        document.getElementById('startQuiz').style.display = 'block'; // Quiz-Button anzeigen
    } catch (error) {
        console.error('Upload-Fehler:', error);
        alert('Ein Fehler ist beim Hochladen aufgetreten.');
    }
});

document.getElementById('startQuiz').addEventListener('click', startQuiz);

function startQuiz() {
    if (vocabList.length === 0) {
        alert('Keine Vokabeln vorhanden. Lade zuerst eine Datei hoch!');
        return;
    }

    let score = 0;
    let currentIndex = 0;

    const askQuestion = () => {
        if (currentIndex >= vocabList.length) {
            alert(`Quiz beendet! Du hast ${score} von ${vocabList.length} richtig.`);
            return;
        }

        const currentVocab = vocabList[currentIndex];
        const userAnswer = prompt(`Frage: ${currentVocab.question}`);
        if (userAnswer && userAnswer.trim().toLowerCase() === currentVocab.answer.toLowerCase()) {
            alert('Richtig!');
            score++;
        } else {
            alert(`Falsch! Die richtige Antwort ist: ${currentVocab.answer}`);
        }
        currentIndex++;
        askQuestion();
    };

    askQuestion();
}
