SETUK PROPOSAL: EDIT AND DOWNLOAD AS PDF
=========================================

Nothing needs to be installed and no internet connection is required.
Use Google Chrome or Microsoft Edge on a computer.


1. OPEN
   Unzip the folder, then double-click index.html (or drag it into Chrome).

2. EDIT
   Click "Edit text" at the top, then click any text on the page and type.
     - Ctrl + B        bold
     - Ctrl + Z        undo
     - Pasted text comes in as plain text, so it matches the document's style.
   Hover over a page to see page options: add a blank page after it,
   duplicate it, or delete it. Page numbers update by themselves.
   Click "Done editing" when finished.

   If a page has too much text, it gets a red outline and the top bar says
   which page is too long. Shorten the text or move a block to the next page,
   otherwise the end of that page will be cut off in the PDF.

3. DOWNLOAD PDF
   Click "Download PDF". In the print window:
     - Destination: Save as PDF
     - Leave everything else as it is (the page size and margins are set by
       the document)
   Then click Save. The file is named Setuk_DM_Letter_Tracking_Proposal.pdf.

4. KEEP YOUR CHANGES
   Your edits are kept automatically in this browser, so closing the tab
   does not lose them. To keep them in the file itself (for example before
   sending the folder to someone), click "Save HTML" and save over
   index.html in this folder.
   "Discard changes" goes back to the file as it was last saved.


WHAT IS IN THE FOLDER
   index.html             the proposal (all the text is here)
   assets/proposal.css    layout, colours and type
   assets/editor.css      the editing buttons (never printed)
   assets/editor.js       the editing buttons (never printed)
   fonts/                 Inter, Inter Tight and JetBrains Mono, so it looks
                          the same on any computer
   Setuk_DM_Letter_Tracking_Proposal.pdf   the current version, for reference

Keep these files together: index.html needs the assets and fonts folders
next to it.


FOR SOMEONE EDITING THE CODE
   - Each <section class="page"> in index.html is one A4 page.
   - Colours are at the top of assets/proposal.css under :root. Changing
     --accent changes the main blue everywhere.
   - Storage bar chart (section 7): the bar heights follow the values written
     above the bars ("220 GB", "1.1 TB"), so editing the text is enough.
   - Status diagram, component diagram and schedule chart are drawn in code.
     Their labels and positions are edited in index.html (the <svg> blocks
     and the "g-bar" left/width percentages).
   - Other browsers: Firefox and Safari also print correctly, but in Firefox
     turn off "Print headers and footers" in the print window.
