import { jsPDF } from "jspdf";

interface LifePath {
    category: string;
    icon: string;
    current: string;
    projection: string;
    score: number;
}

interface Scenario {
    type: string;
    title: string;
    description: string;
    lifePaths: LifePath[];
    narrative: string;
}

interface FutureData {
    scenarios: Scenario[];
    wisdomContent: string;
    createdAt: string;
}

/**
 * Generate a PDF blueprint of the future visualization
 */
export function generateFutureBlueprintPDF(
    futureData: FutureData,
    userName: string = "Your"
): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7): number => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, x, y);
            y += lineHeight;
        });
        return y;
    };

    // Title
    doc.setFontSize(24);
    doc.setTextColor(100, 50, 150);
    doc.text(`${userName} Future Blueprint`, margin, yPos);
    yPos += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("20-Year Life Projection • AI-Generated Vision", margin, yPos);
    yPos += 5;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(futureData.createdAt).toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Process each scenario
    futureData.scenarios.forEach((scenario, index) => {
        // Check if we need a new page
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        // Scenario header with color coding
        const colors: { [key: string]: [number, number, number] } = {
            optimistic: [34, 197, 94],  // green
            current: [59, 130, 246],    // blue
            warning: [245, 158, 11]     // amber
        };
        const color = colors[scenario.type] || [100, 100, 100];

        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(margin, yPos - 5, pageWidth - margin * 2, 12, "F");

        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        const scenarioLabel = index === 0 ? "✨ OPTIMISTIC PATH" : index === 1 ? "📊 CURRENT TRAJECTORY" : "⚠️ WARNING PATH";
        doc.text(scenarioLabel, margin + 5, yPos + 3);
        yPos += 15;

        // Scenario title and description
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text(scenario.title, margin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        yPos = addWrappedText(scenario.description, margin, yPos, pageWidth - margin * 2);
        yPos += 5;

        // Narrative
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        yPos = addWrappedText(scenario.narrative, margin, yPos, pageWidth - margin * 2);
        yPos += 10;

        // Life Path Breakdown table
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text("Life Path Breakdown:", margin, yPos);
        yPos += 8;

        scenario.lifePaths.forEach((path) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);

            // Category with icon
            doc.text(`${path.icon} ${path.category}`, margin, yPos);

            // Score visualization
            const scoreX = margin + 50;
            for (let i = 0; i < 10; i++) {
                if (i < path.score) {
                    doc.setFillColor(color[0], color[1], color[2]);
                } else {
                    doc.setFillColor(220, 220, 220);
                }
                doc.rect(scoreX + i * 6, yPos - 3, 5, 5, "F");
            }

            doc.text(`${path.score}/10`, scoreX + 65, yPos);
            yPos += 7;

            // Current and projection
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            yPos = addWrappedText(`Now: ${path.current}`, margin + 5, yPos, pageWidth - margin * 2 - 10, 5);
            yPos = addWrappedText(`Future: ${path.projection}`, margin + 5, yPos, pageWidth - margin * 2 - 10, 5);
            yPos += 5;
        });

        yPos += 10;
    });

    // Wisdom content
    if (futureData.wisdomContent) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFillColor(255, 243, 224);
        doc.rect(margin, yPos - 5, pageWidth - margin * 2, 25, "F");

        doc.setFontSize(10);
        doc.setTextColor(180, 120, 50);
        doc.text("💫 WISDOM", margin + 5, yPos + 2);
        yPos += 8;

        doc.setTextColor(120, 80, 30);
        yPos = addWrappedText(futureData.wisdomContent, margin + 5, yPos, pageWidth - margin * 2 - 10, 5);
        yPos += 15;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by 2moro • AI-Powered Life Intelligence", margin, 285);
    doc.text("This blueprint is based on current data patterns and is meant for inspiration.", margin, 290);

    // Save the PDF
    doc.save(`${userName.replace(/\s+/g, "_")}_Future_Blueprint.pdf`);
}
