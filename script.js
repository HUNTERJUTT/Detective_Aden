// Localized memory core checking algorithms. Each user has unique variables[cite: 1]
let level = parseInt(localStorage.getItem("detective_level")) || 1;
let correct = parseInt(localStorage.getItem("detective_correct")) || 0;
let total = parseInt(localStorage.getItem("detective_total")) || 0;

let caseStart = Date.now();
let suspects = [];
let criminal = "";
let selectedMobileIndex = null;

// Hardware Environment Check
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* ---------------- AUDIO CONTROLLER MODULE ---------------- */
function safeAudio(src) {
    let a = new Audio(src);
    a.onerror = () => {};
    return a;
}

const correctSound = safeAudio("sounds/correct.mp3");
const wrongSound = safeAudio("sounds/wrong.mp3");
const levelSound = safeAudio("sounds/levelup.mp3");
const clickSound = safeAudio("sounds/click.mp3");

correctSound.volume = 0.5;
wrongSound.volume = 0.5;
levelSound.volume = 0.6;
clickSound.volume = 0.3;

/* ---------------- THE MASTER 50-LEVEL DATABASE ---------------- */
// 50 unique levels with 5 custom statements each (Totaling 250 unique alibis)
const masterLevels = {
    1: {
        crime: "Golden Crown Theft", place: "Royal Museum",
        clue: "Forensics found bright green grass stains on the white floor rug.",
        suspects: [
            { type: "Criminal", name: "Ali", text: "I was playing football outside on the lawn all evening." },
            { type: "RedHerring", name: "Ahmed", text: "I was painting a picture of a green forest in the art studio." },
            { type: "Innocent", name: "Sara", text: "I was reading a history book in the quiet library corner." },
            { type: "Innocent", name: "Fatima", text: "I was eating a sweet mango at the kitchen table." },
            { type: "Innocent", name: "Zara", text: "I was typing a long email on the desktop computer." }
        ]
    },
    2: {
        crime: "Diamond Ring Robbery", place: "Jewelry Boutique",
        clue: "There is a strong smell of sweet wood smoke near the empty glass case.",
        suspects: [
            { type: "Criminal", name: "Hassan", text: "I was sitting by the outdoor campfire baking jacket potatoes." },
            { type: "RedHerring", name: "Ayesha", text: "I was blowing out some tiny scented birthday candles." },
            { type: "Innocent", name: "Omar", text: "I was washing my dirty hands inside the restroom sink." },
            { type: "Innocent", name: "Hiba", text: "I was searching for a lost blue pen under the couch cushions." },
            { type: "Innocent", name: "Areeba", text: "I was organizing the shiny new boxes on the stock shelves." }
        ]
    },
    3: {
        crime: "Secret Recipe Theft", place: "Bakery Kitchen",
        clue: "The thief left behind sticky drops of yellow honey on the counter.",
        suspects: [
            { type: "Criminal", name: "Usman", text: "I was mixing hot tea with honey to soothe my sore throat." },
            { type: "RedHerring", name: "Zain", text: "I was cutting up ripe yellow bananas for a fruit salad dessert." },
            { type: "Innocent", name: "Ayesha", text: "I was sweeping the dry flour dust off the tiled floor." },
            { type: "Innocent", name: "John", text: "I was wiping the windows clean with a damp blue cloth." },
            { type: "Innocent", name: "David", text: "I was counting the empty milk bottles behind the back door." }
        ]
    },
    4: {
        crime: "Rare Comic Book Loss", place: "Bookstore Vault",
        clue: "A tiny patch of soft, white cat fur was found stuck to the bookshelf.",
        suspects: [
            { type: "Criminal", name: "James", text: "I was brushing and feeding my fluffy white kitten in the lobby." },
            { type: "RedHerring", name: "William", text: "I was wearing a thick white woolen winter sweater all day." },
            { type: "Innocent", name: "Noah", text: "I was stacking heavy dictionaries on the top display rack." },
            { type: "Innocent", name: "Daniel", text: "I was fixing a loose wheel on the library book cart." },
            { type: "Innocent", name: "Emily", text: "I was coloring a poster using my bright red sketch markers." }
        ]
    },
    5: {
        crime: "Mainframe System Hack", place: "Tech Hub Server Room",
        clue: "The room smells heavily of strong mint candy.",
        suspects: [
            { type: "Criminal", name: "Lucas", text: "I was chewing an extra-strong mint gum to stay wide awake." },
            { type: "RedHerring", name: "Michael", text: "I was drinking a hot cup of herbal green tea at my desk." },
            { type: "Innocent", name: "Liam", text: "I was unboxing brand new computer mice from plastic wraps." },
            { type: "Innocent", name: "Chris", text: "I was wiping the computer monitors with an anti-dust spray." },
            { type: "Innocent", name: "Elena", text: "I was shredding old printout sheets in the corner machine." }
        ]
    },
    6: {
        crime: "Golden Artifact Swap", place: "Ancient Exhibit Hall",
        clue: "There are wet, muddy shoe outlines coming from the side window.",
        suspects: [
            { type: "Criminal", name: "Mason", text: "I just walked back inside after watering the muddy garden plots." },
            { type: "RedHerring", name: "Sophia", text: "I accidentally spilled clean tap water from my glass bottle onto the tiles." },
            { type: "Innocent", name: "Ethan", text: "I was hanging up new informational posters on the main wall boards." },
            { type: "Innocent", name: "Olivia", text: "I was polishing the glass display frames with a smooth dry sponge." },
            { type: "Innocent", name: "Jacob", text: "I was sorting ancient stone arrowheads inside plastic storage trays." }
        ]
    },
    7: {
        crime: "Laptop Prototype Break-in", place: "R&D Design Lab",
        clue: "A broken piece of a bright pink plastic eraser was left on the table.",
        suspects: [
            { type: "Criminal", name: "Ava", text: "I was drawing engineering pencil sketches and rubbing out mistakes." },
            { type: "RedHerring", name: "Logan", text: "I was using a bright pink highlighter pen to mark text rules." },
            { type: "Innocent", name: "Isabella", text: "I was plugging data transfer cables into the back of the servers." },
            { type: "Innocent", name: "Lucas", text: "I was sweeping up bits of wire clippings from the lab floor floor." },
            { type: "Innocent", name: "Mia", text: "I was testing the laptop keyboard keys one by one for lag." }
        ]
    },
    8: {
        crime: "Cash Box Raid", place: "Ticket Counter Office",
        clue: "The floor near the safe has fine silvery glitter dust on it.",
        suspects: [
            { type: "Criminal", name: "Jackson", text: "I was cutting up sparkling glitter sheets for a school craft poster." },
            { type: "RedHerring", name: "Oliver", text: "I was polishing the shiny silver coins to put them in rolls." },
            { type: "Innocent", name: "Charlotte", text: "I was checking the serial numbers on the paper money stacks." },
            { type: "Innocent", name: "Aiden", text: "I was shredding old transaction receipts from last month." },
            { type: "Innocent", name: "Amelia", text: "I was resetting the digital passcode on the front door panel." }
        ]
    },
    9: {
        crime: "Ancient Painting Cutout", place: "Art Gallery Wing",
        clue: "A sharp smell of vinegar and oil salad dressing hangs in the air.",
        suspects: [
            { type: "Criminal", name: "Ethan", text: "I was eating a fresh Greek cucumber salad for my late dinner." },
            { type: "RedHerring", name: "Harper", text: "I was cleaning old paintbrushes with an industrial spirit chemical." },
            { type: "Innocent", name: "Liam", text: "I was mounting heavy wooden canvas frames onto the plaster walls." },
            { type: "Innocent", name: "Evelyn", text: "I was wiping down the overhead spotlight casings to clear cobwebs." },
            { type: "Innocent", name: "Benjamin", text: "I was taking digital camera photos of the gallery entrance room." }
        ]
    },
    10: {
        crime: "Golden Statue Disappearance", place: "Central Plaza Display",
        clue: "There is a distinct aroma of roasted coffee beans around the base.",
        suspects: [
            { type: "Criminal", name: "Abigail", text: "I was grinding premium coffee beans to make a hot latte beverage." },
            { type: "RedHerring", name: "Ali", text: "I was drinking a cold chocolate milkshake from a paper cup." },
            { type: "Innocent", name: "Ahmed", text: "I was sweeping up dry leaves that blew inside from the main gates." },
            { type: "Innocent", name: "Sara", text: "I was adjusting the position of the heavy velvet boundary ropes." },
            { type: "Innocent", name: "Fatima", text: "I was changing the alkaline batteries inside the security flashlights." }
        ]
    },
    // LEVELS 11-20
    11: {
        crime: "Exotic Plant Theft", place: "Botanical Conservatory",
        clue: "Forensics found white powdery chalk traces on the broken stem.",
        suspects: [
            { type: "Criminal", name: "Zara", text: "I was writing the plant names on the slate labels with classroom chalk." },
            { type: "RedHerring", name: "Hassan", text: "I was mixing white fertilizer powder into the potting soil beds." },
            { type: "Innocent", name: "Ayesha", text: "I was trimming dead brown leaves off the climbing ivy walls." },
            { type: "Innocent", name: "Omar", text: "I was adjusting the automated mist nozzles to spray more water." },
            { type: "Innocent", name: "Hiba", text: "I was sweeping the gravel pathway to keep the track looking neat." }
        ]
    },
    12: {
        crime: "Crypto Wallet Ledger Theft", place: "Finance Manager Locker",
        clue: "A strong smell of cinnamon candy can be detected in the small room.",
        suspects: [
            { type: "Criminal", name: "Areeba", text: "I was sucking on some spicy red cinnamon drops for my cough." },
            { type: "RedHerring", name: "Usman", text: "I was baking sweet apple tarts with sugar powder in the break oven." },
            { type: "Innocent", name: "Zain", text: "I was counting the plastic paperclips inside the desk drawer drawers." },
            { type: "Innocent", name: "Ayesha", text: "I was oiling the squeaky hinges of the steel file cabinets." },
            { type: "Innocent", name: "John", text: "I was organizing the business tax files by color coding the folders." }
        ]
    },
    13: {
        crime: "Diamond Necklace Hijack", place: "VIP Dressing Wardrobe",
        clue: "A broken piece of a bright blue ink pen clip was found near the vanity.",
        suspects: [
            { type: "Criminal", name: "David", text: "I was filling out the clothing inventory form when my blue pen snapped." },
            { type: "RedHerring", name: "James", text: "I was sewing a loose blue button back onto a model's dress shirt." },
            { type: "Innocent", name: "William", text: "I was hanging up heavy designer winter coats inside the closet space." },
            { type: "Innocent", name: "Noah", text: "I was steaming out the wrinkles from the silk evening gowns." },
            { type: "Innocent", name: "Daniel", text: "I was cleaning fingerprints off the big dressing room mirrors." }
        ]
    },
    14: {
        crime: "Historical Manuscript Theft", place: "Library Archives",
        clue: "There are grey ash particles sitting right on top of the display table.",
        suspects: [
            { type: "Criminal", name: "Emily", text: "I was burning the frayed string edges of the file folder folders to neat them up." },
            { type: "RedHerring", name: "Lucas", text: "I was dusting old soot off the fireplace mantelpiece in the reading hall." },
            { type: "Innocent", name: "Michael", text: "I was cataloging historical world maps from the nineteenth century." },
            { type: "Innocent", name: "Liam", text: "I was pasting protective clear plastic covers onto old textbook prints." },
            { type: "Innocent", name: "Chris", text: "I was sorting matching magazine volumes into chronological order piles." }
        ]
    },
    15: {
        crime: "Encrypted Flash Drive Robbery", place: "Security Control Deck",
        clue: "The room smells strongly of orange citrus skin peel.",
        suspects: [
            { type: "Criminal", name: "Elena", text: "I was peeling and eating a couple of fresh oranges at my desk workstation." },
            { type: "RedHerring", name: "Mason", text: "I sprayed a chemical lemon disinfectant over the network key panels." },
            { type: "Innocent", name: "Sophia", text: "I was double-checking the live camera feeds on the display walls." },
            { type: "Innocent", name: "Ethan", text: "I was entering employee badge numbers into the main system system." },
            { type: "Innocent", name: "Olivia", text: "I was rebooting the primary backup power router systems in the closet." }
        ]
    },
    16: {
        crime: "Ancient Coin Box Theft", place: "Vault Corridor B",
        clue: "Forensics discovered tiny drops of red wax on the metal locking bar.",
        suspects: [
            { type: "Criminal", name: "Jacob", text: "I was sealing envelope packages using red wax stamps to make them official." },
            { type: "RedHerring", name: "Ava", text: "I was painting a red wood box with glossy acrylic color brush paint." },
            { type: "Innocent", name: "Logan", text: "I was lubricating the heavy wheel tracks using industrial clear grease." },
            { type: "Innocent", name: "Isabella", text: "I was sorting key rings into separate cardboard storage containers." },
            { type: "Innocent", name: "Lucas", text: "I was sweeping up scrap bits of tape from the packing station floors." }
        ]
    },
    17: {
        crime: "Rare Specimen Sneak-out", place: "Biology Lab Counter",
        clue: "The floor beneath the counter is sticky with transparent liquid sugar syrup.",
        suspects: [
            { type: "Criminal", name: "Mia", text: "I accidentally dropped my bottle of pancake syrup in the staff breakroom room." },
            { type: "RedHerring", name: "Jackson", text: "I was pouring liquid chemical gel into test tubes for a science test." },
            { type: "Innocent", name: "Oliver", text: "I was wiping down the microscope lenses with specialized tissue paper papers." },
            { type: "Innocent", name: "Charlotte", text: "I was checking the thermometer readings inside the cooling fridge units." },
            { type: "Innocent", name: "Aiden", text: "I was alphabetizing the biological sample jars on the glass shelf ranks." }
        ]
    },
    18: {
        crime: "Antique Clock Robbery", place: "Timepiece Exhibition",
        clue: "A smell of burnt popcorn is trapped inside the display glass frame area.",
        suspects: [
            { type: "Criminal", name: "Amelia", text: "I overheated a popcorn bag in the break microwave and caused a lot of smoke." },
            { type: "RedHerring", name: "Ethan", text: "I was roasting sweet almonds in a pan over a hot plate element." },
            { type: "Innocent", name: "Harper", text: "I was winding up the spring mechanics of the grandfather clock displays." },
            { type: "Innocent", name: "Liam", text: "I was polishing the wooden exterior panel casings with beeswax spray." },
            { type: "Innocent", name: "Evelyn", text: "I was printing out label cards describing when the clocks were built." }
        ]
    },
    19: {
        crime: "Master Keycard Pickpocket", place: "Manager Front Office",
        clue: "A tiny strand of bright purple thread was found on the leather chair arm.",
        suspects: [
            { type: "Criminal", name: "Benjamin", text: "I was knitting a warm violet scarf for my grandmother during my break." },
            { type: "RedHerring", name: "Abigail", text: "I was highlighting task notes using a dark purple neon markers stick." },
            { type: "Innocent", name: "Ali", text: "I was filed down the sharp edge of a metal desk drawer sliders." },
            { type: "Innocent", name: "Ahmed", text: "I was watering the green indoor leafy potted plants near the windows." },
            { type: "Innocent", name: "Sara", text: "I was replacing the dry black ink ribbon inside the printing machine." }
        ]
    },
    20: {
        crime: "Golden Violin Loot", place: "Music Instrument Room",
        clue: "White dust from a violin rosin block was dropped all over the room carpet.",
        suspects: [
            { type: "Criminal", name: "Fatima", text: "I was applying rosin chalk blocks to my musical bow strings to prep them." },
            { type: "RedHerring", name: "Zara", text: "I accidentally spilled talcum powder from my sports bag onto the table bench." },
            { type: "Innocent", name: "Hassan", text: "I was checking the wire string tension adjustments on the acoustic guitars." },
            { type: "Innocent", name: "Ayesha", text: "I was arranging musical score sheet booklets inside the sorting cabinet cabinets." },
            { type: "Innocent", name: "Omar", text: "I was wiping down the wooden piano keys using a safe alcohol fluid." }
        ]
    },
    // LEVELS 21-30
    21: {
        crime: "Designer Watch Swindle", place: "Luxury Store Display",
        clue: "There are drops of white correction fluid on the glass case top.",
        suspects: [
            { type: "Criminal", name: "Hiba", text: "I was painting over writing errors on my paper inventory forms using Whitener." },
            { type: "RedHerring", name: "Areeba", text: "I was using white paste glue to label price tags onto cardboard boxes." },
            { type: "Innocent", name: "Usman", text: "I was wiping down the glass shelves using a blue window spray bottle." },
            { type: "Innocent", name: "Zain", text: "I was setting the precise local time zones on the digital watches." },
            { type: "Innocent", name: "Ayesha", text: "I was placing leather watch bands into separate velvet storage containers." }
        ]
    },
    22: {
        crime: "Secret Strategy Dossier Theft", place: "Conference Room Box",
        clue: "A distinct smell of strong peppermint tea lingers around the room corner.",
        suspects: [
            { type: "Criminal", name: "John", text: "I was drinking a cup of hot mint tea to fix my stomach aches." },
            { type: "RedHerring", name: "David", text: "I was spraying a mint scented aerosol to make the smelly room fresh." },
            { type: "Innocent", name: "James", text: "I was shredding old printouts using the heavy paper destruction unit." },
            { type: "Innocent", name: "William", text: "I was adjusting the HDMI monitor wires connected to the main screen projector." },
            { type: "Innocent", name: "Noah", text: "I was aligning the executive rolling chairs around the oval desk structure." }
        ]
    },
    23: {
        crime: "Golden Telescope Lens Theft", place: "Roof Observatory Deck",
        clue: "There are smudges of dark grease marks left right on the metal frame knob.",
        suspects: [
            { type: "Criminal", name: "Daniel", text: "I was oiling the gears of the rolling roof dome track with heavy black grease." },
            { type: "RedHerring", name: "Emily", text: "I was coloring an astronomy star chart using dark graphite pencils." },
            { type: "Innocent", name: "Lucas", text: "I was cleaning the giant glass mirror using special optical microfiber towels." },
            { type: "Innocent", name: "Michael", text: "I was writing down telescope angle metrics into the logbook binder." },
            { type: "Innocent", name: "Liam", text: "I was replacing the backup battery units inside the star tracker motor housing." }
        ]
    },
    24: {
        crime: "Rare Stamp Album Theft", place: "Collector Safe Deck",
        clue: "A strong smell of banana fruit scent is left behind near the desk area.",
        suspects: [
            { type: "Criminal", name: "Chris", text: "I was snacking on sweet yellow bananas while working on my file sorting." },
            { type: "RedHerring", name: "Elena", text: "I used a banana-scented furniture wax oil to give the desk wood a high polish." },
            { type: "Innocent", name: "Mason", text: "I was using fine tweezers to sort the delicate vintage stamps by year." },
            { type: "Innocent", name: "Sophia", text: "I was sliding protective plastic sleeves onto the stamp binder sheets." },
            { type: "Innocent", name: "Ethan", text: "I was cataloging world postal stamp names into the desktop spreadsheet tool." }
        ]
    },
    25: {
        crime: "Server Access Key Theft", place: "Network Node Room",
        clue: "A tiny bit of shining gold foil wrapper was dropped right behind the server rack.",
        suspects: [
            { type: "Criminal", name: "Olivia", text: "I was unwrapping chocolate gold coins and eating them for energy." },
            { type: "RedHerring", name: "Jacob", text: "I was using gold metallic paint to stencil numbers onto the key cabinets." },
            { type: "Innocent", name: "Ava", text: "I was tying loose networking data cables together using yellow zip ties." },
            { type: "Innocent", name: "Logan", text: "I was running an automatic software update script on the master console terminal." },
            { type: "Innocent", name: "Isabella", text: "I was blowing dust out of the server fans using a compressed air can." }
        ]
    },
    26: {
        crime: "Diamond Earring Shoplift", place: "Display Cabinet Suite",
        clue: "The empty velvet display tray smells heavily of lavender flower extract perfume.",
        suspects: [
            { type: "Criminal", name: "Lucas", text: "I was applying lavender scented hand lotion to treat my dry skin areas." },
            { type: "RedHerring", name: "Mia", text: "I was unpacking fresh lavender flowers from a cardboard delivery box." },
            { type: "Innocent", name: "Jackson", text: "I was adjusting the overhead halogen spotlights to shine on the display display." },
            { type: "Innocent", name: "Oliver", text: "I was counting the luxury jewelry storage cases inside the vault." },
            { type: "Innocent", name: "Charlotte", text: "I was scanning barcode sticker tags on incoming shipment box bundles." }
        ]
    },
    27: {
        crime: "Encrypted Data Drive Theft", place: "Research Computer Pod",
        clue: "There are traces of red clay dirt on the computer power cord wire.",
        suspects: [
            { type: "Criminal", name: "Aiden", text: "I was re-potting plants in the clay greenhouse before coming back to my desk." },
            { type: "RedHerring", name: "Amelia", text: "I was sculpting a red pottery vase in the art craft zone across the hall." },
            { type: "Innocent", name: "Ethan", text: "I was backing up computer directory files onto external hard storage storage." },
            { type: "Innocent", name: "Harper", text: "I was cleaning off old sticky residue from the desktop workspace with a sponge." },
            { type: "Innocent", name: "Liam", text: "I was setting up an ergonomic wrist support padding pad for the mouse keyboard." }
        ]
    },
    28: {
        crime: "Ancient Jade Carving Loss", place: "East Heritage Wing",
        clue: "A strong aroma of strawberry fruit candy fill the empty artifact spot.",
        suspects: [
            { type: "Criminal", name: "Evelyn", text: "I was eating a pack of chewy strawberry candy treats during my routine checks." },
            { type: "RedHerring", name: "Benjamin", text: "I sprayed a sweet strawberry room mist spray near the main entrance door." },
            { type: "Innocent", name: "Abigail", text: "I was wiping dust off the base pedestals using an static wool duster." },
            { type: "Innocent", name: "Ali", text: "I was checking if the glass door locking mechanisms were clicking shut securely." },
            { type: "Innocent", name: "Ahmed", text: "I was translating ancient descriptive tags into modern English text records." }
        ]
    },
    29: {
        crime: "Master Safe Combination Theft", place: "Executive Office Desk",
        clue: "The safe dial has fine black smudge prints from charcoal material.",
        suspects: [
            { type: "Criminal", name: "Sara", text: "I was shading a custom art drawing sketch with raw artist charcoal blocks." },
            { type: "RedHerring", name: "Fatima", text: "I was cleaning out old soot ash from the fireplace heater grate panel." },
            { type: "Innocent", name: "Zara", text: "I was filed copies of business contract papers into steel file boxes." },
            { type: "Innocent", name: "Hassan", text: "I was refilling the table water decanter with fresh clear mineral water water." },
            { type: "Innocent", name: "Ayesha", text: "I was resetting the digital clock timer on the wall mount fixture." }
        ]
    },
    30: {
        crime: "Rare Pearl Disappearance", place: "Ocean Exhibit Vault",
        clue: "There is a smell of sour vinegar cleaner hovering around the display tank.",
        suspects: [
            { type: "Criminal", name: "Omar", text: "I was using a vinegar water mix to scrub hard salt scales off the tank glass." },
            { type: "RedHerring", name: "Hiba", text: "I was eating salt and vinegar potato crisps out of a shiny foil bag bag." },
            { type: "Innocent", name: "Areeba", text: "I was checking the salinity level gauges of the main ocean water supply water." },
            { type: "Innocent", name: "Usman", text: "I was replacing the chemical carbon filter pads inside the pump system room." },
            { type: "Innocent", name: "Zain", text: "I was cataloging exotic sea clam shells into wooden grid storage boxes." }
        ]
    },
    // LEVELS 31-40
    31: {
        crime: "Golden Medal Robbery", place: "Sports Trophy Pavilion",
        clue: "Forensics found white chalk marks on the secure vault handle grip.",
        suspects: [
            { type: "Criminal", name: "Ayesha", text: "I was rub gym chalk powder on my palms for lifting practice weights." },
            { type: "RedHerring", name: "John", text: "I was drawing white target grid coordinates down on the court floor blackboard." },
            { type: "Innocent", name: "David", text: "I was polishing the brass presentation platters using a dry microfiber microfiber cloth." },
            { type: "Innocent", name: "James", text: "I was stringing up a new tournament net framework across the court poles." },
            { type: "Innocent", name: "William", text: "I was grouping promotional sports shirts into size category display crates." }
        ]
    },
    32: {
        crime: "Secret Codebook Theft", place: "Intelligence Office Safe",
        clue: "The desk space smells distinctly of hot toasted cheese bread crust.",
        suspects: [
            { type: "Criminal", name: "Noah", text: "I made a toasted cheese sandwich in the microwave and slightly burnt the edges." },
            { type: "RedHerring", name: "Daniel", text: "I was slicing up fresh cheddar cheese bricks for a party snack plate room." },
            { type: "Innocent", name: "Emily", text: "I was cross-referencing printed security code lists with the computer log logs." },
            { type: "Innocent", name: "Lucas", text: "I was filing data entry sheets into separate alphabetic binder structures." },
            { type: "Innocent", name: "Michael", text: "I was running an diagnostic hardware analysis on the cryptography module drive." }
        ]
    },
    33: {
        crime: "Rare Fossil Bone Theft", place: "Paleontology Lab Table",
        clue: "A stray bit of bright orange woolen fiber was caught on the bone display case.",
        suspects: [
            { type: "Criminal", name: "Liam", text: "I was stitching an orange wool blanket patch back together in the break hour." },
            { type: "RedHerring", name: "Chris", text: "I was using a bright neon orange highlighter marker to check lab notes." },
            { type: "Innocent", name: "Elena", text: "I was brushing sand dust off fragile fossil fragments with a soft hair tool brush." },
            { type: "Innocent", name: "Mason", text: "I was cataloging dinosaur tooth models inside padded wooden archive cases." },
            { type: "Innocent", name: "Sophia", text: "I was filling out the museum registry database for incoming bone crates." }
        ]
    },
    34: {
        crime: "Diamond Scepter Theft", place: "Royal Treasury Suite",
        clue: "The floor near the glass cabinet has sticky residue drops of fruit jelly.",
        suspects: [
            { type: "Criminal", name: "Ethan", text: "I was eating toasted biscuits with sweet grape fruit jelly for a light snack snack." },
            { type: "RedHerring", name: "Olivia", text: "I was pouring thick clear liquid adhesive jelly into a craft seal form." },
            { type: "Innocent", name: "Jacob", text: "I was polishing the gold plating panels on the coronation scepter stand mount." },
            { type: "Innocent", name: "Ava", text: "I was checking the battery level lights on the laser trip alarm sensors framework." },
            { type: "Innocent", name: "Logan", text: "I was re-keying the cylinder padlock units on the reserve treasure lockers." }
        ]
    },
    35: {
        crime: "Mainframe Hardware Swap", place: "Data Central Core Room",
        clue: "The ventilation unit near the broken rack smells like strong dark coffee.",
        suspects: [
            { type: "Criminal", name: "Isabella", text: "I spilled a cup of fresh espresso coffee right near the floor vent openings." },
            { type: "RedHerring", name: "Lucas", text: "I was eating a chocolate mocha energy snack bar at my server desk station." },
            { type: "Innocent", name: "Mia", text: "I was tying computer networking cables away from the path using plastic clips ties." },
            { type: "Innocent", name: "Jackson", text: "I was installing server rack expansion rails with a magnetic screwdriver tool." },
            { type: "Innocent", name: "Oliver", text: "I was scanning system temperature monitors to make sure the room stayed cool." }
        ]
    },
    36: {
        crime: "Vintage Watch Collection Raid", place: "Antique Vault Deck",
        clue: "There are traces of yellow beeswax polish residue left on the lock latch.",
        suspects: [
            { type: "Criminal", name: "Charlotte", text: "I was rubbing natural yellow beeswax block onto the old wooden display drawers." },
            { type: "RedHerring", name: "Aiden", text: "I was burning a yellow scented paraffin candle to clear the stale air smell." },
            { type: "Innocent", name: "Amelia", text: "I was using fine iron tweezers to arrange gears inside watch display cases cases." },
            { type: "Innocent", name: "Ethan", text: "I was sorting velvet lining materials into specific size boxes inside stock stacks." },
            { type: "Innocent", name: "Harper", text: "I was copying model manufacture numbers into the master antique registry folder book." }
        ]
    },
    37: {
        crime: "Encrypted Network Blueprint Loss", place: "Engineering Drawing Pod",
        clue: "The layout table has fine silver glitter flakes spread across its surface.",
        suspects: [
            { type: "Criminal", name: "Liam", text: "I was gluing sparkling silver glitter stars onto my niece's school solar map map." },
            { type: "RedHerring", name: "Evelyn", text: "I was polishing shiny silver trophy plates using a polishing paste chemical fluid." },
            { type: "Innocent", name: "Benjamin", text: "I was rolling up blueprint papers and putting them inside plastic tubes storage." },
            { type: "Innocent", name: "Abigail", text: "I was replacing the black toner container units inside the plotting printer deck." },
            { type: "Innocent", name: "Ali", text: "I was securing draft papers down onto the tilted desks using drafting tape strips strips." }
        ]
    },
    38: {
        crime: "Rare Gold Nugget Swap", place: "Geology Minerals Room",
        clue: "There is a sharp smell of alcohol citrus sanitizer near the cabinet case.",
        suspects: [
            { type: "Criminal", name: "Ahmed", text: "I used a strong lemon citrus spray cleaner to clean the glass mineral cabinets clear." },
            { type: "RedHerring", name: "Sara", text: "I was peeling and eating a couple of sour lemon candy pieces at my post table." },
            { type: "Innocent", name: "Fatima", text: "I was weighing raw quartz stone samples using a digital analytical scale unit." },
            { type: "Innocent", name: "Zara", text: "I was printing barcode identification sticker labels for the crystal stone boxes stack." },
            { type: "Innocent", name: "Hassan", text: "I was adjusting the metal stand positions inside the geology display window rows." }
        ]
    },
    39: {
        crime: "Prototype Processor Theft", place: "Microchip Clean Lab",
        clue: "A small fragment of blue ballpoint pen plastic was dropped by the dock tray.",
        suspects: [
            { type: "Criminal", name: "Ayesha", text: "My cheap blue plastic pen snapped in half while I was writing down processing test values." },
            { type: "RedHerring", name: "Omar", text: "I was marking dynamic cleanroom plastic bins using a thick blue ink permanent marker marker." },
            { type: "Innocent", name: "Hiba", text: "I was checking microchip circuit traces using a high-magnification desktop microscope monitor." },
            { type: "Innocent", name: "Areeba", text: "I was counting sterile silicon wafer disks inside protective vacuum storage boxes containers." },
            { type: "Innocent", name: "Usman", text: "I was changing the air filter screens on the particle extractor unit wall grids." }
        ]
    },
    40: {
        crime: "Historical Treaty Theft", place: "Document Archive Vault",
        clue: "The floor near the documents has traces of dried red clay mud pieces.",
        suspects: [
            { type: "Criminal", name: "Zain", text: "I was mixing red clay soil to fix the base of greenhouse flower pots pots." },
            { type: "RedHerring", name: "Ayesha", text: "I was painting an old brick outline drawing sketch sheet with crimson red acrylic wash paint." },
            { type: "Innocent", name: "John", text: "I was scanning antique treaty paperwork pages into a digital archive cloud server folder." },
            { type: "Innocent", name: "David", text: "I was tying old legal ledger books together with secure brown cotton packaging ropes." },
            { type: "Innocent", name: "James", text: "I was dusting off the upper wooden document racks using a feather dusting stick tool." }
        ]
    },
    // LEVELS 41-50
    41: {
        crime: "Diamond Tiara Robbery", place: "Exhibition Hall West",
        clue: "A distinct smell of burning vanilla scented wax candle sticks fills the air space.",
        suspects: [
            { type: "Criminal", name: "William", text: "I was melting vanilla scented sealing wax to stamp official envelope package letters." },
            { type: "RedHerring", name: "Noah", text: "I was baking sweet vanilla extract cream biscuits in the staff break room oven range." },
            { type: "Innocent", name: "Daniel", text: "I was polishing glass crystal light chandeliers using clear alcohol spray and rags." },
            { type: "Innocent", name: "Emily", text: "I was arranging decorative velvet display steps inside the primary display corner framework." },
            { type: "Innocent", name: "Lucas", text: "I was matching inventory numbers on security tags with the printout sheet lists lists." }
        ]
    },
    42: {
        crime: "Main Crypto Node Hack", place: "Network Router Vault",
        clue: "A wrapper fragment of intense mint gum was found stuck behind the router.",
        suspects: [
            { type: "Criminal", name: "Michael", text: "I was chewing powerful peppermint gum strips to keep focused on data sorting tasks." },
            { type: "RedHerring", name: "Liam", text: "I was sipping on hot organic spearmint leaf tea from a thermal travel mug container cup." },
            { type: "Innocent", name: "Chris", text: "I was changing optical fiber connection cables along the wall mount routing paths racks." },
            { type: "Innocent", name: "Elena", text: "I was clearing system log cache directories on the master terminal control board database." },
            { type: "Innocent", name: "Mason", text: "I was labeling network link switches with self-adhesive printed yellow vinyl sticker tape." }
        ]
    },
    43: {
        crime: "Master Keycard Pickpocket", place: "Main Administration Pod",
        clue: "A tiny strand of bright purple wool yarn fiber was left behind on the chair.",
        suspects: [
            { type: "Criminal", name: "Sophia", text: "I was crocheting a violet wool hat bundle for my sibling in the lounge break hours." },
            { type: "RedHerring", name: "Ethan", text: "I was marking urgent file lines with a bright purple neon highlight marker pen stick." },
            { type: "Innocent", name: "Olivia", text: "I was printing out incoming employee registration profile sheets on the laser printing system deck." },
            { type: "Innocent", name: "Jacob", text: "I was clearing jamming paper sheets out from the document shredder machine input slider paths." },
            { type: "Innocent", name: "Ava", text: "I was sorting desk mailbox document folders into chronological order stacks by year dates." }
        ]
    },
    44: {
        crime: "Rare Gem Collector Loot", place: "Mineral Exhibition Display",
        clue: "The safe dial mechanism has traces of dark graphite powder smudges.",
        suspects: [
            { type: "Criminal", name: "Logan", text: "I was using heavy graphite art pencils to sketch layout drafts of rock structures sheets." },
            { type: "RedHerring", name: "Isabella", text: "I was sweeping out dark fireplace charcoal soot ashes inside the maintenance room grate vents." },
            { type: "Innocent", name: "Lucas", text: "I was wiping off display glass surfaces with a streak-free optical microfiber wipe cloth." },
            { type: "Innocent", name: "Mia", text: "I was grouping crystal stone samples by hardness metrics inside grid partitioned cases." },
            { type: "Innocent", name: "Jackson", text: "I was checking security lock hinges on the secondary storage window screens frameworks panel." }
        ]
    },
    45: {
        crime: "Ancient Script Swindle", place: "Library High Security Deck",
        clue: "A strong smell of vinegar liquid chemical cleaner hangs around the table rows.",
        suspects: [
            { type: "Criminal", name: "Oliver", text: "I used raw white vinegar mix to treat old wood desk mold spots in the desk corner." },
            { type: "RedHerring", name: "Charlotte", text: "I was eating a packet of salt and vinegar potato crisps at the lobby reception desks desk." },
            { type: "Innocent", name: "Aiden", text: "I was cataloging historical manuscript roll tags into the local desktop asset inventory app." },
            { type: "Innocent", name: "Amelia", text: "I was checking relative humidity levels gauges inside the ancient script archive preservation rooms." },
            { type: "Innocent", name: "Ethan", text: "I was placing acid-free paper spacer sheets between old manuscript document pages files safe." }
        ]
    },
    46: {
        crime: "Enchanted Ring Replica Swap", place: "History Vault Room",
        clue: "Forensics found white chalk marks left on the open case edge stand track.",
        suspects: [
            { type: "Criminal", name: "Harper", text: "I was mark storage boxes layout spots down on the floor tiles using a chalk marker block." },
            { type: "RedHerring", name: "Liam", text: "I accidentally spilled white baby talcum powder from my sports bag onto the side bench desk." },
            { type: "Innocent", name: "Evelyn", text: "I was checking serial numbering codes engraved inside the silver ring replica base slots mounts." },
            { type: "Innocent", name: "Benjamin", text: "I was adjusting matching lighting angle brackets over the historical jewelry displays panels rows." },
            { type: "Innocent", name: "Abigail", text: "I was clean dust layer formations off velvet insert panels inside the reserve stock boxes cases." }
        ]
    },
    47: {
        crime: "Secret Business Strategy Raid", place: "Executive Office Suite",
        clue: "The floor beneath the broken cabinet drawer has sticky drops of sweet honey.",
        suspects: [
            { type: "Criminal", name: "Ali", text: "I was stir honey drops into my lemon herbal beverage cup drink to help clear my voice." },
            { type: "RedHerring", name: "Ahmed", text: "I was slicing up ripe yellow mango fruit slices for a quick afternoon food break bowl." },
            { type: "Innocent", name: "Sara", text: "I was filing corporate tax declaration sheets inside steel suspension track cabinets containers box." },
            { type: "Innocent", name: "Fatima", text: "I was clear old dry adhesive tape leftovers off the table surface layout using a steel scraper." },
            { type: "Innocent", name: "Zara", text: "I was setting up an electronic desk clock display unit with fresh battery cell replacements packs." }
        ]
    },
    48: {
        crime: "Data Server Main Card Theft", place: "Network Router Block C",
        clue: "The area around the card chassis smells strongly of fresh orange rind peel.",
        suspects: [
            { type: "Criminal", name: "Hassan", text: "I was peeling and snack on some juicy oranges at my server room router workspace desk station." },
            { type: "RedHerring", name: "Ayesha", text: "I used an industrial lemon citrus solvent liquid to strip old stickers off network terminal frameworks." },
            { type: "Innocent", name: "Omar", text: "I was checking data connection terminal blink codes along the master server board rack grids loop." },
            { type: "Innocent", name: "Hiba", text: "I was blow dust accumulation away from heat sinks units utilizing a compressed air canister jet." },
            { type: "Innocent", name: "Areeba", text: "I was log system update ticket records inside the company central hardware maintenance app tracker." }
        ]
    },
    49: {
        crime: "Ancient Jade Figurine Swindle", place: "Museum East Vault",
        clue: "There are traces of red clay soil sitting right on top of the case velvet backing pad.",
        suspects: [
            { type: "Criminal", name: "Usman", text: "I was re-potting decorative baseline terracotta clay pots out in the conservatory glass room." },
            { type: "RedHerring", name: "Zain", text: "I was painting a red canvas design pattern using heavy body red acrylic color tubes on card sheets." },
            { type: "Innocent", name: "Ayesha", text: "I was wipe glass framing surfaces clear of finger smudge prints using special window cleaner bottles spray." },
            { type: "Innocent", name: "John", text: "I was translation ancient symbol lines list text onto descriptive paper tag labels for display mounts." },
            { type: "Innocent", name: "David", text: "I was change security lock batteries packs inside the secondary display vault cabinets drawers framework." }
        ]
    },
    50: {
        crime: "Ultimate Master Diamond Loss", place: "Grand Central Treasury Safe",
        clue: "Forensics found fine silver glitter dust flakes sitting on the security dial wheel.",
        suspects: [
            { type: "Criminal", name: "James", text: "I was help my kid finish a glitter craft solar planet map board with silver sparkling stars sheets." },
            { type: "RedHerring", name: "William", text: "I was use silver metal polish spray paste to shine up the ornamental display trophy cup rows columns." },
            { type: "Innocent", name: "Noah", text: "I was match incoming inventory code tags listings with digital database system ledger files cloud paths." },
            { type: "Innocent", name: "Daniel", text: "I was re-keying safety lockers padlock sets blocks inside the backup reserve secure storage room facility." },
            { type: "Innocent", name: "Emily", text: "I was align velvet layout cushions displays mounts inside the main security display cases window tracks." }
        ]
    }
};

/* ---------------- PROGRESS AUTOMATION DATA CORE[cite: 1] ---------------- */
function saveProgressToDevice() {
    localStorage.setItem("detective_level", level);
    localStorage.setItem("detective_correct", correct);
    localStorage.setItem("detective_total", total);
}

function clearSavedProgress() {
    if(confirm("Are you sure you want to completely erase your progress and start over from Case 1?")) {
        localStorage.clear();
        level = 1;
        correct = 0;
        total = 0;
        newCase();
        alertBanner("Dossier progress tracking has been reset completely.", "#64748b");
    }
}

/* ---------------- THEME SHIFTER (DYNAMIC PALETTES) ---------------- */
function applyThemeChanges(currentLevel) {
    const root = document.documentElement;
    let themeIndex = Math.floor((currentLevel - 1) / 5) % 5;
    
    switch(themeIndex) {
        case 0:
            root.style.setProperty('--theme-primary', '#38bdf8');
            root.style.setProperty('--theme-bg-glow', '#0b1326');
            root.style.setProperty('--theme-border', '#334155');
            root.style.setProperty('--theme-accent', 'rgba(56, 189, 248, 0.15)');
            break;
        case 1:
            root.style.setProperty('--theme-primary', '#f87171');
            root.style.setProperty('--theme-bg-glow', '#2d0f0f');
            root.style.setProperty('--theme-border', '#5c1e1e');
            root.style.setProperty('--theme-accent', 'rgba(248, 113, 113, 0.15)');
            break;
        case 2:
            root.style.setProperty('--theme-primary', '#34d399');
            root.style.setProperty('--theme-bg-glow', '#062419');
            root.style.setProperty('--theme-border', '#105b3e');
            root.style.setProperty('--theme-accent', 'rgba(52, 211, 153, 0.15)');
            break;
        case 3:
            root.style.setProperty('--theme-primary', '#fbbf24');
            root.style.setProperty('--theme-bg-glow', '#2a1f07');
            root.style.setProperty('--theme-border', '#634a0c');
            root.style.setProperty('--theme-accent', 'rgba(251, 191, 36, 0.15)');
            break;
        case 4:
            root.style.setProperty('--theme-primary', '#c084fc');
            root.style.setProperty('--theme-bg-glow', '#1e0b36');
            root.style.setProperty('--theme-border', '#4c1d95');
            root.style.setProperty('--theme-accent', 'rgba(192, 132, 252, 0.15)');
            break;
    }
}

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

/* ---------------- CASE ENGINE BUILDER ---------------- */
function buildFreshCaseMatrix(currentLevel) {
    // Safely pull the specific static data block from the 50 master levels catalog
    let caseData = masterLevels[currentLevel] || masterLevels[1];

    let temporarySuspectDeck = [];
    let allocatedCriminalName = "";

    // Shuffle the preset 5 suspect profiles so their board positions change every reload
    let profiles = shuffle([...caseData.suspects]);

    profiles.forEach((p) => {
        if (p.type === "Criminal") {
            allocatedCriminalName = p.name;
        }
        temporarySuspectDeck.push({
            name: p.name,
            statement: p.text,
            isCriminal: (p.type === "Criminal"),
            hasBeenRead: false
        });
    });

    let briefDescriptionHTML = `🚨 <b>INCIDENT RADAR REPORT:</b> A high-profile <b>${caseData.crime}</b> was carried out inside the <b>${caseData.place}</b>!<br><br>` +
                               `🔍 <b>CRIME SCENE FORENSICS ELEVATION:</b> ${caseData.clue}<br><br>` +
                               `<i>Note: Think carefully! Match the clue details to the suspect activity that would naturally make that trace!</i>`;

    return {
        briefHTML: briefDescriptionHTML,
        cardsDeck: temporarySuspectDeck,
        targetCriminal: allocatedCriminalName
    };
}

function updateUI() {
    let currentAccuracy = total ? Math.round((correct / total) * 100) : 100;
    let liveSeconds = Math.floor((Date.now() - caseStart) / 1000);

    document.getElementById("box1").innerText = "Case " + level;
    document.getElementById("box2").innerText = "Accuracy " + currentAccuracy + "%";
    document.getElementById("box3").innerText = "Time " + liveSeconds + "s";
}

function newCase() {
    if (level > 50) {
        triggerEndGameUI();
        return;
    }

    applyThemeChanges(level);
    
    const promptElement = document.getElementById("deviceInstruction");
    if (promptElement) {
        promptElement.innerText = isMobileDevice 
            ? "Tap any suspect to bring up the Inspect or Arrest option menu." 
            : "Click 'Inspect' to read statements. You can only arrest after checking their files.";
    }

    caseStart = Date.now();
    
    let board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";
    
    let activeCaseData = buildFreshCaseMatrix(level);
    suspects = activeCaseData.cardsDeck;
    criminal = activeCaseData.targetCriminal;

    let caseBox = document.getElementById("caseTitle");
    let infoBox = document.getElementById("caseInfo");

    if (caseBox) caseBox.innerText = `Active Inquiry File #${level} / 50`;
    if (infoBox) infoBox.innerHTML = activeCaseData.briefHTML;

    renderSuspectCards();
    updateUI();
}

function renderSuspectCards() {
    let board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";

    suspects.forEach((sus, idx) => {
        let div = document.createElement("div");
        div.className = `suspect ${sus.hasBeenRead ? 'read' : ''}`;
        
        let statusMarker = sus.hasBeenRead ? "ANALYZED ✅" : "UNREAD 🔒";

        if (isMobileDevice) {
            div.innerHTML = `
                <div class="suspect-meta-info">👤 ${sus.name}</div>
                <div class="suspect-status-tag">${statusMarker}</div>
            `;
            div.onclick = () => {
                clickSound.play();
                triggerMobileMenuOverlay(idx);
            };
        } else {
            div.innerHTML = `
                <div class="suspect-meta-info">👤 ${sus.name} <span style="font-size: 0.8rem; font-weight: normal; margin-left:10px; color:#64748b;">${statusMarker}</span></div>
                <div class="pc-action-tray">
                    <button class="pc-btn read-btn" onclick="event.stopPropagation(); openSuspectFileCard(${idx})">Inspect</button>
                    <button class="pc-btn arrest-btn" onclick="event.stopPropagation(); processAccusation('${sus.name}')">Arrest</button>
                </div>
            `;
            div.onclick = () => {
                clickSound.play();
                openSuspectFileCard(idx);
            };
        }

        board.appendChild(div);
    });
}

/* ---------------- ACTION HANDLERS & MODALS ---------------- */
function triggerMobileMenuOverlay(index) {
    selectedMobileIndex = index;
    let suspect = suspects[index];
    
    document.getElementById("menuSuspectName").innerText = `Inquiry Action Profile: ${suspect.name}`;
    
    let inspectBtn = document.getElementById("menuInspectBtn");
    let arrestBtn = document.getElementById("menuArrestBtn");

    inspectBtn.onclick = () => {
        closeMobileMenu();
        openSuspectFileCard(index);
    };

    if (suspect.hasBeenRead) {
        arrestBtn.className = "menu-btn arrest";
        arrestBtn.onclick = () => {
            closeMobileMenu();
            processAccusation(suspect.name);
        };
    } else {
        arrestBtn.className = "menu-btn arrest locked";
        arrestBtn.onclick = () => {
            alertBanner("You must inspect this suspect's dossier file before making an arrest!", "#64748b");
        };
    }

    document.getElementById("mobileMenu").classList.remove("hidden");
}

function closeMobileMenu() {
    document.getElementById("mobileMenu").classList.add("hidden");
}

function openSuspectFileCard(index) {
    suspects[index].hasBeenRead = true;
    let selectedSuspect = suspects[index];
    
    function getRandomEmoji() {
        const profileEmojis = ["🕵️‍♂️", "🧐", "🔎", "📝", "📁", "📂"];
        return profileEmojis[Math.floor(Math.random() * profileEmojis.length)];
    }
    let chosenEmoji = getRandomEmoji();

    document.getElementById("popupData").innerHTML =
        `<span class="emoji-pop">${chosenEmoji}</span>` +
        `<b>Suspect Subject Name:</b> ${selectedSuspect.name}<br><br>` +
        `<b>Interview Alibi:</b><br><span style="color:#a7f3d0; font-style:italic;">"${selectedSuspect.statement}"</span>`;

    document.getElementById("popup").classList.remove("hidden");
    renderSuspectCards();
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

function processAccusation(chosenName) {
    total++;
    let alertBannerWindow = document.getElementById("result");

    if (chosenName === criminal) {
        correct++;
        level++;
        correctSound.play();
        levelSound.play();

        alertBannerWindow.innerText = `Case Solved! Clear for next file.`;
        alertBannerWindow.style.background = "#10b981";
        alertBannerWindow.style.color = "#ffffff";
    } else {
        wrongSound.play();
        alertBannerWindow.innerText = `False Arrest! Clues re-verified.`;
        alertBannerWindow.style.background = "#ef4444";
        alertBannerWindow.style.color = "#ffffff";
    }

    // Save state variables seamlessly to individual browser cache pipelines[cite: 1]
    saveProgressToDevice();
    alertBannerWindow.style.display = "block";

    setTimeout(() => {
        alertBannerWindow.style.display = "none";
        newCase();
    }, 1600);

    updateUI();
}

function alertBanner(msg, color) {
    let b = document.getElementById("result");
    b.innerText = msg;
    b.style.background = color;
    b.style.color = "#ffffff";
    b.style.display = "block";
    setTimeout(() => b.style.display = "none", 2000);
}

function triggerEndGameUI() {
    const primaryBox = document.querySelector(".game-container");
    if (primaryBox) {
        primaryBox.innerHTML = `
            <div class="victory-card">
                <h1>Congratulations!</h1>
                <p>You have completed the game. I appreciate you that you have completed this game.</p>
                <p>I am still working on this games development. I hope you will find another version in some days.</p>
                <em>Final Grade Metrics: Completed all 50 operational modules smoothly!</em>
            </div>
        `;
    }
}

// Global clock processing ticks
setInterval(() => {
    if (level <= 50) {
        updateUI();
    }
}, 1000);

/* -------- ADVANCED PHYSICS BACKGROUND PARTICLES ENGINE -------- */
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.onresize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
};

const raindrops = [];
const splashes = [];
const ambientEbers = [];

for (let i = 0; i < 40; i++) {
    ambientEbers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(0.3 + Math.random() * 0.7),
        opacity: 0.1 + Math.random() * 0.4
    });
}

function animateWeatherEngine() {
    ctx.clearRect(0, 0, width, height);

    ambientEbers.forEach(p => {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
            p.x = Math.random() * width;
        }
    });

    if (raindrops.length < 65) {
        raindrops.push({
            x: Math.random() * width,
            y: -20,
            length: 12 + Math.random() * 14,
            speed: 12 + Math.random() * 6,
            opacity: 0.06 + Math.random() * 0.12
        });
    }

    ctx.lineWidth = 1.0;
    raindrops.forEach((drop, idx) => {
        ctx.strokeStyle = `rgba(148, 163, 184, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > height - 12) {
            if (Math.random() > 0.5) {
                splashes.push({
                    x: drop.x,
                    y: height - 6,
                    vx: (Math.random() - 0.5) * 2.2,
                    vy: -Math.random() * 2.0,
                    radius: 0.7 + Math.random() * 0.8,
                    life: 1.0
                });
            }
            raindrops.splice(idx, 1);
        }
    });

    splashes.forEach((splash, idx) => {
        ctx.fillStyle = `rgba(148, 163, 184, ${splash.life * 0.18})`;
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
        ctx.fill();

        splash.x += splash.vx;
        splash.y += splash.vy;
        splash.vy += 0.15; 
        splash.life -= 0.08;

        if (splash.life <= 0) {
            splashes.splice(idx, 1);
        }
    });

    requestAnimationFrame(animateWeatherEngine);
}

/* ---------------- INITIALIZATION RUNNERS ---------------- */
newCase();
animateWeatherEngine();
