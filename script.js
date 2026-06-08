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

/* ---------------- THE MASTER NATURAL 50-LEVEL DATABASE ---------------- */
const masterLevels = {
    1: {
        crime: "Ruined Birthday Surprise", place: "The School Cafeteria",
        clue: "Someone smashed the cake, leaving sticky streaks of yellow honey on the floor panels.",
        suspects: [
            { name: "Zain", type: "Criminal", text: "Look at my throat, it's completely red! I had to mix a giant spoonful of honey into my warm tea to stop coughing during the party setup." },
            { name: "Sara", type: "RedHerring", text: "Don't look at me, I hate sweet things. I spent my afternoon cutting up sour green apples for the fruit bowls." },
            { name: "Ahmed", type: "Innocent", text: "Honestly, I was just sweeping up the paper confetti that fell from the ceiling decorations." },
            { name: "Fatima", type: "Innocent", text: "I didn't even go near the kitchen! I was trying to fix a loose wire on the music sound system." },
            { name: "Ali", type: "Innocent", text: "My job was just counting the plastic forks to make sure we had enough for all the guests." }
        ]
    },
    2: {
        crime: "The Missing School Mascot", place: "The Science Lab Courtyard",
        clue: "The bunny cage was unlocked, and someone left bright green grass stains on the clean white floor tiles.",
        suspects: [
            { name: "Hassan", type: "Criminal", text: "We were playing football out on the main lawn all evening, and the ball flew over the fence into the bushes." },
            { name: "Ayesha", type: "RedHerring", text: "I spent my time painting a giant green forest landscape on the classroom art chalkboard." },
            { name: "Omar", type: "Innocent", text: "I was sitting quietly at the back desk reading a thick history book about ancient kings." },
            { name: "Hiba", type: "Innocent", text: "My hands are clean! I was just typing out the lab safety notes on the computer terminal." },
            { name: "Zara", type: "Innocent", text: "I spent the last hour washing my dirty coffee mug at the staff room sink." }
        ]
    },
    3: {
        crime: "Movie Set Prop Disaster", place: "The Hollywood Studio Lot",
        clue: "The priceless medieval sword prop was scratched, and there was a heavy smell of wood smoke near the rack.",
        suspects: [
            { name: "Kamran", type: "Criminal", text: "The weather got freezing cold, so I gathered some scrap wood and lit a small campfire outside my trailer." },
            { name: "Nida", type: "RedHerring", text: "I was blowing out dozens of tiny birthday candles on the director's surprise party cupcakes." },
            { name: "Bilal", type: "Innocent", text: "I was moving heavy equipment boxes out of the wardrobe truck all afternoon." },
            { name: "Sana", type: "Innocent", text: "My job was just ironing the historical silk costumes so they wouldn't look wrinkly on camera." },
            { name: "Hamza", type: "Innocent", text: "I stayed inside the makeup room cleaning the foundation brushes with rubbing alcohol." }
        ]
    },
    4: {
        crime: "Gaming Server Shutdown", place: "The Mainframe Server Room",
        clue: "Someone pulled the main network power plug while chewing on an extra-strong mint candy.",
        suspects: [
            { name: "Usman", type: "Criminal", text: "I was falling asleep at my desk, so I popped a super strong piece of peppermint gum to shock myself awake." },
            { name: "Maria", type: "RedHerring", text: "I had a massive cup of hot herbal green tea sitting right next to my mouse pad." },
            { name: "Raza", type: "Innocent", text: "I spent the entire shift unboxing brand new computer keyboards from their plastic packaging." },
            { name: "Amna", type: "Innocent", text: "Don't blame me, I was over in Sector B dusting off the old monitor screens with a micro cloth." },
            { name: "Fahad", type: "Innocent", text: "I was running a shredding machine to get rid of the printed paper logs from last year." }
        ]
    },
    5: {
        crime: "The Missing Diamond Ring", place: "The Jewelry Vault",
        clue: "The security lock was bypassed, and investigators found fine powdery white chalk traces left on the metal handle.",
        suspects: [
            { name: "Bilal", type: "Criminal", text: "I was using white chalk blocks to write down the daily price updates on the storefront slate board." },
            { name: "Asma", type: "RedHerring", text: "I was lifting heavy supply boxes in the stockroom and put some baby powder on my hands so they wouldn't slip." },
            { name: "Junaid", type: "Innocent", text: "I was busy trimming the dead leaves off the indoor decorative plants near the front window." },
            { name: "Sania", type: "Innocent", text: "My schedule was completely packed with organizing the shiny velvet display boxes on the shelves." },
            { name: "Tariq", type: "Innocent", text: "I didn't touch anything. I was sweeping the loose dust off the gravel path outside." }
        ]
    },
    6: {
        crime: "Mystery Alarm Trigger", place: "The Art Museum Gallery",
        clue: "The lasers went off, and wet, muddy shoe footprints were found leading straight from the side window frame.",
        suspects: [
            { name: "Kashif", type: "Criminal", text: "The hose broke outside, and I spent a long time watering the dry mud beds around the courtyard flowers." },
            { name: "Sadia", type: "RedHerring", text: "I accidentally knocked over a full water bottle right onto the slippery marble floor." },
            { name: "Waqas", type: "Innocent", text: "I was standing up on a tall ladder hanging the new oil painting posters on the wall panels." },
            { name: "Zoya", type: "Innocent", text: "My assignment was just wiping fingerprints off the glass exhibition frames with a dry sponge." },
            { name: "Danish", type: "Innocent", text: "I spent my evening counting the ancient stone artifacts to see if the catalog matched." }
        ]
    },
    7: {
        crime: "The Stolen Comic Book", place: "The Bookstore Attic",
        clue: "A rare first-edition comic went missing, leaving behind a few strands of fluffy white animal fur.",
        suspects: [
            { name: "Farhan", type: "Criminal", text: "My white Persian cat was crying in the lobby, so I brought him upstairs to brush out his coat." },
            { name: "Alia", type: "RedHerring", text: "It's freezing in here! I've been wearing this heavy, fuzzy white wool sweater all morning." },
            { name: "Sami", type: "Innocent", text: "I was stacking the big dictionaries onto the heavy display racks at the front entrance." },
            { name: "Kiran", type: "Innocent", text: "I spent hours fixing a squeaky wheel on the rolling metal library book cart." },
            { name: "Asif", type: "Innocent", text: "I was busy coloring the store sale sign using my bright red sketch markers." }
        ]
    },
    8: {
        crime: "The Office Prank Gone Wrong", place: "The Manager's Private Desk",
        clue: "Someone glued the keyboard to the desk, leaving a broken piece of a bright pink eraser behind.",
        suspects: [
            { name: "Imran", type: "Criminal", text: "I was drawing rough sketches for the new logo design and had to rub out a ton of pencil mistakes." },
            { name: "Nadia", type: "RedHerring", text: "I didn't touch an eraser. I was marking the important report pages with a neon pink highlighter." },
            { name: "Haris", type: "Innocent", text: "I was underneath the desk plugging the internet cables back into the main terminal docks." },
            { name: "Iqra", type: "Innocent", text: "I spent my time sweeping up the metal staple clips from the office floor." },
            { name: "Saad", type: "Innocent", text: "I was just testing the spacebars on the new laptops to make sure they didn't get stuck." }
        ]
    },
    9: {
        crime: "The Gold Medal Heist", place: "The High School Trophy Case",
        clue: "The lock was picked, and the area near the trophy base was covered in shining silver glitter flakes.",
        suspects: [
            { name: "Yasir", type: "Criminal", text: "My daughter has a school science project due tomorrow, so I was helping her glue silver glitter stars on cardboard." },
            { name: "Mehak", type: "RedHerring", text: "I wanted the display to look nice, so I spent an hour polishing the silver cups with a metal cleaning paste." },
            { name: "Arsalan", type: "Innocent", text: "I was verifying the serial numbers printed on the bottom of the tournament plaques." },
            { name: "Anum", type: "Innocent", text: "I didn't go near the glass! I was shredding old permission slips in the back office." },
            { name: "Rizwan", type: "Innocent", text: "I was completely locked out in the corridor resetting the digital passcode on the front door." }
        ]
    },
    10: {
        crime: "The Secret Formula Leak", place: "The Chemical Research Lab",
        clue: "A top-secret project file was photographed, leaving a sharp smell of vinegar and oil salad dressing in the cubicle.",
        suspects: [
            { name: "Shahid", type: "Criminal", text: "I skipped lunch, so I brought a giant homemade cucumber salad with Italian vinegar dressing to eat at my desk." },
            { name: "Aima", type: "RedHerring", text: "I was cleaning the old oil paint stains off the lab table using an industrial chemical spirit cleaner." },
            { name: "Nabeel", type: "Innocent", text: "I spent my time mounting the new wooden safety chart frames onto the dry walls." },
            { name: "Saba", type: "Innocent", text: "I was focused on wiping down the overhead spotlight casings to remove spider webs." },
            { name: "Waseem", type: "Innocent", text: "I was using the office digital camera to take pictures of the new lab equipment boxes." }
        ]
    },
    11: {
        crime: "The Golden Violin Swap", place: "The Music Conservatory Vault",
        clue: "A fake instrument was put in place, leaving white dust from a violin rosin block all over the floor velvet.",
        suspects: [
            { name: "Tayyab", type: "Criminal", text: "I had a solo performance coming up, so I was heavily rubbing rosin chalk onto my wooden bow strings." },
            { name: "Fiza", type: "RedHerring", text: "I accidentally dropped my gym bag, and a container of white talcum powder spilled on the bench." },
            { name: "Adnan", type: "Innocent", text: "I was just checking the tuning pegs and string tension on the acoustic guitars in the corner." },
            { name: "Rida", type: "Innocent", text: "My job was just alphabetizing the sheet music booklets inside the wooden storage cabinet." },
            { name: "Salman", type: "Innocent", text: "I spent the evening wiping the dust off the grand piano keys with a specialized clean wipe." }
        ]
    },
    12: {
        crime: "The Cryptographic Safe Breach", place: "The Finance Manager's Locker",
        clue: "The digital ledger device was stolen, leaving behind a strong scent of roasted coffee beans near the keypad.",
        suspects: [
            { name: "Faizan", type: "Criminal", text: "I had to stay up for a double shift, so I was grinding fresh espresso beans to brew a dark coffee drink." },
            { name: "Hira", type: "RedHerring", text: "I was sitting in the lounge drinking a sweet chocolate milkshake through a paper straw." },
            { name: "Zubair", type: "Innocent", text: "I spent my evening sweeping up the dry leaves that blew into the lobby from the front gate." },
            { name: "Nimra", type: "Innocent", text: "I was nowhere near the ledger! I was moving the heavy red velvet crowd ropes out in the hallway." },
            { name: "Adeel", type: "Innocent", text: "My task was simple: replacing the dead batteries inside the night-shift security flashlights." }
        ]
    },
    13: {
        crime: "The Missing Rare Plant", place: "The Botanical Greenhouse",
        clue: "A unique tropical orchid was stolen, leaving behind sticky drops of red candle wax on the metal locking latch.",
        suspects: [
            { name: "Arshad", type: "Criminal", text: "The power went out in my workshop, so I lit a red wax candle stamp to seal up some package envelopes." },
            { name: "Shiza", type: "RedHerring", text: "I was painting the wooden flower pots with a coat of bright crimson red acrylic paint." },
            { name: "Umair", type: "Innocent", text: "I was just applying a clear mechanical grease oil to the squeaky greenhouse door tracks." },
            { name: "Kinza", type: "Innocent", text: "I spent the morning sorting the spare brass key rings into labeled plastic boxes." },
            { name: "Ahsan", type: "Innocent", text: "I was sweeping up bits of old brown packing tape from the floor near the shipping desk." }
        ]
    },
    14: {
        crime: "The Diamond Necklace Swap", place: "The Theatre Dressing Room",
        clue: "The prop necklace was replaced with glass, and a broken piece of a bright blue ink pen clip was found on the mirror table.",
        suspects: [
            { name: "Wajid", type: "Criminal", text: "I was filling out the actor costume sign-out log sheet when my blue plastic pen snapped right in my hand." },
            { name: "Sahar", type: "RedHerring", text: "I was busy sewing a shiny blue sapphire button back onto the main actor's stage jacket." },
            { name: "Rehman", type: "Innocent", text: "I spent the whole night organizing the heavy woolen winter coats back onto the clothing racks." },
            { name: "Laiba", type: "Innocent", text: "I was in the corner using the heavy clothing steamer to remove wrinkles from the silk dresses." },
            { name: "Moiz", type: "Innocent", text: "My job was just cleaning the fingerprint smudges off the large wall mirrors with a glass spray." }
        ]
    },
    15: {
        crime: "Historical Document Loss", place: "The Central Archives",
        clue: "An old peace treaty script was taken, and grey ash particles were found sitting on the document wooden shelf.",
        suspects: [
            { name: "Zahid", type: "Criminal", text: "The threads on the old folder bounds were loose, so I used a lighter to burn the fuzzy string edges neat." },
            { name: "Khadija", type: "RedHerring", text: "I was assigned to clean the charcoal soot out from the reading room fireplace mantelpiece." },
            { name: "Atif", type: "Innocent", text: "I spent the afternoon cataloging old maps of the city that dates back to the 1800s." },
            { name: "Iram", type: "Innocent", text: "I was applying protective clear plastic sheets over the fragile textbook covers." },
            { name: "Babar", type: "Innocent", text: "I was simply gathering the old news magazines into matching chronological stacks." }
        ]
    },
    16: {
        crime: "The Stolen Flash Drive", place: "The Security Command Room",
        clue: "An encrypted data drive was taken, and the room smells strongly of sweet orange citrus fruit skins.",
        suspects: [
            { name: "Shoaib", type: "Criminal", text: "I brought a couple of fresh oranges from home and was peeling them at my console desk during the movie break." },
            { name: "Maham", type: "RedHerring", text: "The system panels were dirty, so I sprayed an industrial lemon-scented chemical disinfectant over the buttons." },
            { name: "Zeeshan", type: "Innocent", text: "I was glued to the monitor wall keeping an eye on the outdoor perimeter cameras." },
            { name: "Erum", type: "Innocent", text: "My hand hurts from typing! I was entering employee security badge codes into the network database." },
            { name: "Noman", type: "Innocent", text: "I was stuck inside the server closet rebooting the primary network router boxes." }
        ]
    },
    17: {
        crime: "Rare Specimen Leak", place: "The Biology Research Room",
        clue: "A rare deep-sea fish model went missing, leaving the floor beneath the counter sticky with transparent liquid sugar syrup.",
        suspects: [
            { name: "Gauhar", type: "Criminal", text: "I brought frozen waffles to eat in the break room and accidentally knocked over my bottle of maple syrup." },
            { name: "Bushra", type: "RedHerring", text: "I spent my shift pouring a thick, clear chemical gel substance into the laboratory test tubes." },
            { name: "Taimoor", type: "Innocent", text: "I was adjusting the focus dials on the microscope lenses using specialized tissue paper wipes." },
            { name: "Yumna", type: "Innocent", text: "I was checking the digital temperature readouts inside the chemical storage refrigerator units." },
            { name: "Faisal", type: "Innocent", text: "I spent the last two hours sorting the biological sample glass jars onto the shelf rows." }
        ]
    },
    18: {
        crime: "The Antique Clock Theft", place: "The Timepiece Exhibit Hall",
        clue: "The main grandfather clock was damaged, leaving a strong smell of burnt popcorn trapped inside the display zone.",
        suspects: [
            { name: "Aftab", type: "Criminal", text: "I forgot about my microwave snack in the break room, and the popcorn bag completely caught fire and filled the hall with smoke." },
            { name: "Rania", type: "RedHerring", text: "I was roasting sweet almonds in a metal pan over a hot plate burner out in the lobby area." },
            { name: "Sheraz", type: "Innocent", text: "I was winding up the old brass spring gears on the pendulum wall clocks." },
            { name: "Aiza", type: "Innocent", text: "My job was just polishing the fine mahogany wood frames with a natural beeswax spray." },
            { name: "Zafar", type: "Innocent", text: "I was running the label machine to print out the dates when each clock was made." }
        ]
    },
    19: {
        crime: "The Master Keycard Pickpocket", place: "The Manager's Front Office",
        clue: "The passcard was snatched from a jacket, leaving a tiny strand of bright purple woolen yarn thread on the leather armchair.",
        suspects: [
            { name: "Muneeb", type: "Criminal", text: "My hands need to stay busy, so I was sitting in the lounge knitting a warm purple wool scarf for my sister." },
            { name: "Sobia", type: "RedHerring", text: "I didn't leave any threads! I was using a bright neon purple highlighter marker to check the invoice sheets." },
            { name: "Jawad", type: "Innocent", text: "I was using a metal file tool to smoothen out the sharp edges of the office desk sliders." },
            { name: "Maira", type: "Innocent", text: "I spent the morning watering the indoor green plants and clearing out the dry leaves from the dirt." },
            { name: "Khurram", type: "Innocent", text: "I was busy replacing the old faded black ink ribbon inside the primary receipt printing machine." }
        ]
    },
    20: {
        crime: "The Strategy Document Leak", place: "The Office Conference Block",
        clue: "A top-secret business layout was stolen, leaving a strong smell of spicy cinnamon candy lingering around the executive table.",
        suspects: [
            { name: "Tanveer", type: "Criminal", text: "I had an awful throat tickle, so I was sucking on those strong, hot cinnamon spice drops all evening." },
            { name: "Mehwish", type: "RedHerring", text: "I was heating up a plate of sweet apple cinnamon pastries in the break room oven cooker." },
            { name: "Shehzad", type: "Innocent", text: "I didn't even sit at the table. I was counting the plastic paperclips inside the top desk drawer panels." },
            { name: "Urooj", type: "Innocent", text: "I spent my time putting drops of oil on the squeaky hinges of the heavy metal file cabinets." },
            { name: "Naveed", type: "Innocent", text: "My assignment was sorting the business tax folders into separate color-coded piles." }
        ]
    },
    // LEVELS 21-30
    21: {
        crime: "Luxury Watch Swindle", place: "The Diamond Boutique Suite",
        clue: "A real watch was swapped with a cheap copy, leaving dry drops of white correction fluid on the glass counter top.",
        suspects: [
            { name: "Irfan", type: "Criminal", text: "I made a huge writing mistake on the official paper delivery forms, so I used white corrector fluid to mask it." },
            { name: "Aleeza", type: "RedHerring", text: "I was using white school paste glue to attach the paper price labels onto the bottom of the box containers." },
            { name: "Daniyal", type: "Innocent", text: "I spent the entire afternoon spraying glass cleaner and wiping down the display showcases with paper towels." },
            { name: "Sania", type: "Innocent", text: "My only task was setting the correct local digital times on the display chronograph pieces." },
            { name: "Umair", type: "Innocent", text: "I was moving the empty leather watch bands back into the velvet storage cases in the vault." }
        ]
    },
    22: {
        crime: "The Private Memo Leak", place: "The Boardroom Suite",
        clue: "A confidential text file was copied, leaving a distinct scent of hot peppermint tea around the corner desk.",
        suspects: [
            { name: "Rameez", type: "Criminal", text: "My stomach was feeling totally upset, so I brewed a hot cup of peppermint herbal tea to calm it down." },
            { name: "Natasha", type: "RedHerring", text: "The room felt stuffy and old, so I used a can of mint-scented aerosol spray to make the air feel fresh." },
            { name: "Saqib", type: "Innocent", text: "I spent hours pushing old document printouts into the heavy cross-cut paper shredding machine." },
            { name: "Momina", type: "Innocent", text: "I was crawling under the desk checking the heavy HDMI wires connected to the large wall projector screen." },
            { name: "Zeeshan", type: "Innocent", text: "My job was just aligning the rolling executive desk chairs perfectly around the big oval table structure." }
        ]
    },
    23: {
        crime: "Telescope Lens Smuggling", place: "The Roof Observatory Deck",
        clue: "The main gold-plated lens went missing, leaving heavy smudges of dark grease on the rotation metal knob.",
        suspects: [
            { name: "Khizar", type: "Criminal", text: "The sliding roof track got stuck, so I had to climb up and apply thick black gear grease along the rollers." },
            { name: "Sehrish", type: "RedHerring", text: "I was shading in an astronomy star chart map using my extra dark graphite sketching pencils." },
            { name: "Waleed", type: "Innocent", text: "I was cleaning the main giant glass mirror using a specialized streak-free optical microfiber cloth towel." },
            { name: "Hina", type: "Innocent", text: "I spent my hour entering the star angle numbers into the leather-bound observation logbook binder." },
            { name: "Rameel", type: "Innocent", text: "I was checking the backup lithium battery cells inside the electronic tracking motor housing case." }
        ]
    },
    24: {
        crime: "Rare Stamp Album Theft", place: "The Collector's Private Study",
        clue: "The display safe was unlocked, and a strong smell of sweet banana fruit scent was left near the archive cabinet.",
        suspects: [
            { name: "Zafar", type: "Criminal", text: "I was starving during my filing shift, so I sat in the corner eating a couple of ripe yellow bananas." },
            { name: "Ayla", type: "RedHerring", text: "I used a special banana-scented oil wax to give the ancient mahogany desk wood a nice glossy finish." },
            { name: "Fiaz", type: "Innocent", text: "I was utilizing long steel tweezers to carefully place the old stamps into their display slots by year." },
            { name: "Kanza", type: "Innocent", text: "My assignment was just sliding the clear protective plastic sheets into the stamp collection binder." },
            { name: "Arif", type: "Innocent", text: "I spent my time typing the historical postal registration data into the shop's computer spreadsheet." }
        ]
    },
    25: {
        crime: "Server Room Access Key Theft", place: "The Network Node Closet",
        clue: "The backup passkey went missing, and a tiny piece of shining gold foil wrapper was dropped behind the server rack panels.",
        suspects: [
            { name: "Shakir", type: "Criminal", text: "I bought a bag of chocolate gold coins from the candy store and was unwrapping and eating them for an energy boost." },
            { name: "Noreen", type: "RedHerring", text: "I was using gold metallic paint and a stencil brush to paint serial numbers onto the iron key cabinets." },
            { name: "Jamil", type: "Innocent", text: "I was using yellow plastic zip-ties to bind the loose network data connection wires together neatly." },
            { name: "Shiza", type: "Innocent", text: "I didn't enter the rack zone. I was running a software update script from the master console screen terminal." },
            { name: "Fahed", type: "Innocent", text: "I spent the last hour using a can of compressed air to blow out dust from the server cooling fan vents." }
        ]
    },
    26: {
        crime: "Diamond Earring Shoplift", place: "The Showcase Exhibit Gallery",
        clue: "A pair of diamond studs was taken, and the empty display cushion smells heavily of lavender flower extract perfume.",
        suspects: [
            { name: "Mubashir", type: "Criminal", text: "My skin gets terribly cracked from the dry air, so I rubbed a thick layer of lavender-scented hand cream on my arms." },
            { name: "Sadia", type: "RedHerring", text: "I was unboxing a fresh delivery batch of real dried lavender flowers to put in the lobby entrance vases." },
            { name: "Zain", type: "Innocent", text: "I was on top of a stepstool adjusting the bright halogen spotlights so they would point directly at the gems." },
            { name: "Aqsa", type: "Innocent", text: "My job was just opening the lower wooden drawers to count the empty jewelry boxes we had left." },
            { name: "Haroon", type: "Innocent", text: "I spent my whole shift scanning the barcode stickers attached to the new incoming shipping crates." }
        ]
    },
    27: {
        crime: "Encrypted Hard Drive Robbery", place: "The Research Lab Cubicle",
        clue: "A prototype data drive was stolen, leaving behind traces of red clay dirt smudged on the thick computer power cord.",
        suspects: [
            { name: "Rizwan", type: "Criminal", text: "I was re-potting the courtyard plants into fresh red clay terracotta pots before walking back to the computer." },
            { name: "Amina", type: "RedHerring", text: "I was over in the design art room sculpting a clay model vase for the upcoming exhibition display." },
            { name: "Zahid", type: "Innocent", text: "I spent the evening copying massive directory files from the server onto the external network drive boxes." },
            { name: "Sana", type: "Innocent", text: "I was using a damp sponge to wipe off old sticky tape residue from the top of the office workspaces." },
            { name: "Mustafa", type: "Innocent", text: "I was simply setting up the new foam padded wrist supports in front of the employee keyboards." }
        ]
    },
    28: {
        crime: "Ancient Jade Carving Loss", place: "The East Heritage Corridor",
        clue: "The artifact was lifted off its pillar, leaving a strong aroma of strawberry fruit candy right in the empty display slot.",
        suspects: [
            { name: "Asif", type: "Criminal", text: "I have a sweet tooth, so I was eating a pack of chewy red strawberry candy drops during my floor checks." },
            { name: "Rubab", type: "RedHerring", text: "The air felt stale, so I sprayed a bottle of sweet strawberry-scented room mist near the main visitor gate." },
            { name: "Faraz", type: "Innocent", text: "I was using a fluffy white static wool duster to clean off the dust layers from the marble display bases." },
            { name: "Kiran", type: "Innocent", text: "I was checking each glass door to make sure the mechanical padlocks clicked shut securely when closed." },
            { name: "Imran", type: "Innocent", text: "My job was translating the ancient symbol text rules into modern English on the descriptive paper labels." }
        ]
    },
    29: {
        crime: "Master Safe Combination Theft", place: "The Executive Office Room",
        clue: "The safe dial mechanism was copied, leaving fine black smudge finger prints from charcoal block stick material.",
        suspects: [
            { name: "Sajid", type: "Criminal", text: "I'm an amateur artist, so I was using thick artist charcoal sticks to shade a large face portrait draft on sketch sheets." },
            { name: "Tayyaba", type: "RedHerring", text: "I was assigned to clean out the old burnt wood soot ash from inside the office decorative fireplace hearth." },
            { name: "Naeem", type: "Innocent", text: "I spent the afternoon filing the new client business contract sheets into the steel suspension folders." },
            { name: "Fiza", type: "Innocent", text: "I didn't touch the safe. I was refilling the executive glass water pitcher with fresh clear mineral water." },
            { name: "Basit", type: "Innocent", text: "I was standing up on a chair trying to reset the time digits on the round wall-mounted office clock." }
        ]
    },
    30: {
        crime: "Rare Ocean Pearl Disappearance", place: "The Marine Exhibit Vault",
        clue: "A massive pearl was stolen, leaving a sharp smell of sour vinegar cleaner hovering right over the glass water tank.",
        suspects: [
            { name: "Waqar", type: "Criminal", text: "The tank glass had white salt stains, so I mixed white vinegar with water to scrub the hard crust layers off." },
            { name: "Areej", type: "RedHerring", text: "I was sitting on the bench eating a big bag of salt and vinegar potato chips out of a loud foil bag." },
            { name: "Noman", type: "Innocent", text: "I was completely focused on reading the salinity and salt level meters on the main aquarium display panel." },
            { name: "Sidra", type: "Innocent", text: "My job was just changing out the old chemical carbon filter sponge pads inside the water pump system tank room." },
            { name: "Javed", type: "Innocent", text: "I spent the afternoon sorting the rare sea shells into alphabetical order inside the wooden divider grid boxes." }
        ]
    },
    // LEVELS 31-40
    31: {
        crime: "Sports Trophy Theft", place: "The Pavilion Storage Deck",
        clue: "The glass case was opened, and forensics found white chalk powder marks left right on the vault handle grip.",
        suspects: [
            { name: "Khurram", type: "Criminal", text: "I was doing heavy deadlifts in the gym hall and rubbed a lot of white weightlifting chalk onto my palms." },
            { name: "Naila", type: "RedHerring", text: "I was using a white chalk stick to sketch out the tennis game tactic lines on the wall blackboard." },
            { name: "Arshad", type: "Innocent", text: "I was busy polishing the old silver presentation platters using a dry microfiber cloth towel to remove tarnish." },
            { name: "Sanam", type: "Innocent", text: "My assignment was just stringing up the new white volleyball net framework across the court poles." },
            { name: "Tahir", type: "Innocent", text: "I spent my hour packing the extra tournament t-shirts into separate labeled cardboard display boxes." }
        ]
    },
    32: {
        crime: "The Secret Codebook Theft", place: "The Intelligence Office Safe",
        clue: "A book of codes was copied, leaving a distinct room smell of hot toasted cheese bread crust behind the files.",
        suspects: [
            { name: "Shahbaz", type: "Criminal", text: "I made a quick late-night snack in the office microwave and completely burned the edges of my cheese sandwich." },
            { name: "Lubna", type: "RedHerring", text: "I didn't cook anything. I was using a knife to slice up fresh cheddar cheese cubes for the meeting platter." },
            { name: "Farooq", type: "Innocent", text: "I was sitting at my terminal comparing the printed system code lists with the main computer log registry." },
            { name: "Eman", type: "Innocent", text: "My job was sorting the employee files into separate alphabetical binder cabinets in the archive alcove." },
            { name: "Zeeshan", type: "Innocent", text: "I was running an automatic hardware diagnosis check on the encrypted network hard drive module." }
        ]
    },
    33: {
        crime: "Rare Fossil Bone Theft", place: "The Paleontology Lab Desk",
        clue: "A rare dinosaur tooth was stolen, leaving a stray bit of bright orange woolen fiber caught on the glass hinge.",
        suspects: [
            { name: "Zia", type: "Criminal", text: "My favorite winter blanket was tearing apart, so I used a needle and a spool of bright orange wool yarn to fix it." },
            { name: "Mehwish", type: "RedHerring", text: "I didn't leave any threads! I was using a bright neon orange highlighter pen to color my laboratory report papers." },
            { name: "Asad", type: "Innocent", text: "I spent my shift using a very fine, soft camel-hair brush to clean dirt off the delicate bone fragments." },
            { name: "Hina", type: "Innocent", text: "My job was just typing the fossil names into the digital museum registry database on the laptop terminal." },
            { name: "Tanveer", type: "Innocent", text: "I was in the storage sector moving the newly arrived fossil plaster crates onto the wooden storage pallets." }
        ]
    },
    34: {
        crime: "Diamond Scepter Theft", place: "The Royal Treasury Suite",
        clue: "The gold scepter went missing, leaving sticky residue drops of sweet fruit jelly on the clean white floor tiles.",
        suspects: [
            { name: "Mansoor", type: "Criminal", text: "I brought a toasted bun from home and was spreading a big spoonful of sweet grape jelly on it for my snack." },
            { name: "Alina", type: "RedHerring", text: "I was pouring a thick, clear liquid gel adhesive substance into a specialized resin craft seal mold form." },
            { name: "Shakir", type: "Innocent", text: "I spent the entire shift polishing the brass plating panels on the coronation scepter's display pedestal stand." },
            { name: "Kanza", type: "Innocent", text: "I was checking the tiny battery status lights on the laser trip alarm sensor frames along the wall boundaries." },
            { name: "Naeem", type: "Innocent", text: "My assignment was just changing out the cylinder padlock mechanisms on the backup reserve storage lockers." }
        ]
    },
    35: {
        crime: "Mainframe Card Swap", place: "The Data Core Center",
        clue: "A high-speed processor board was taken, and the air ventilation unit near the server rack smells like strong dark coffee.",
        suspects: [
            { name: "Junaid", type: "Criminal", text: "I was clumsy and spilled a full mug of hot dark espresso coffee right onto the floor air vent openings." },
            { name: "Sabina", type: "RedHerring", text: "I was sitting at my terminal eating a sweet chocolate mocha energy bar to boost my focus during the network lag." },
            { name: "Raza", type: "Innocent", text: "I spent my evening using plastic wire ties to wrap the messy networking data cables away from the main walkway floor." },
            { name: "Uzma", type: "Innocent", text: "I was using a magnetic screwdriver to install the metal extension slider rails inside the empty server server racks." },
            { name: "Fahad", type: "Innocent", text: "My only task was watching the digital temperature gauges on the master screen to make sure the room stayed cool." }
        ]
    },
    36: {
        crime: "Vintage Watch Raid", place: "The Antique Gallery Room",
        clue: "A collection of gold pocket watches went missing, leaving yellow beeswax polish residue on the metal vault latch.",
        suspects: [
            { name: "Tariq", type: "Criminal", text: "The wood was look dry, so I rubbed a block of natural yellow beeswax onto the old display cabinet drawers to shine them up." },
            { name: "Samina", type: "RedHerring", text: "The air felt incredibly stale, so I lit a yellow-colored scented paraffin candle stick out in the corridor lobby." },
            { name: "Waseem", type: "Innocent", text: "I spent hours using a pair of very fine iron tweezers to arrange the tiny gears inside the watch display frame rows." },
            { name: "Sadia", type: "Innocent", text: "My job was just sorting the velvet inner lining materials into different size boxes inside the stock storage stacks." },
            { name: "Aftab", type: "Innocent", text: "I was strictly tasked with copying the old manufacture dates into the museum's leather-bound antique logbook binder." }
        ]
    },
    37: {
        crime: "Network Blueprint Loss", place: "The Engineering Design Pod",
        clue: "The main blueprint paper sheet went missing, and the drawing table has fine silver glitter flakes on its surface.",
        suspects: [
            { name: "Babar", type: "Criminal", text: "I was helping my kid finish a school solar system poster board and was gluing sparkling silver glitter stars onto it." },
            { name: "Nida", type: "RedHerring", text: "I was using a silver metal polishing spray and a cloth to clean up the presentation trophy cups inside the display case." },
            { name: "Haris", type: "Innocent", text: "I spent the last two hours rolling up blueprint sheets and sliding them inside the protective plastic storage tubes." },
            { name: "Maham", type: "Innocent", text: "My hands are dirty from ink! I was replacing the black toner container units inside the main plotting printer desk." },
            { name: "Zubair", type: "Innocent", text: "I was just sticking long strips of clear drafting tape along the edges of the drawing paper to hold them down flat." }
        ]
    },
    38: {
        crime: "Rare Gold Nugget Swap", place: "The Geology Minerals Hall",
        clue: "The safe display was broken, leaving a sharp smell of alcohol citrus sanitizer chemical right next to the cabinet.",
        suspects: [
            { name: "Sohail", type: "Criminal", text: "The cabinet windows were completely smudged, so I sprayed a ton of strong lemon citrus fluid to scrub the glass clear." },
            { name: "Amna", type: "RedHerring", text: "I didn't clean anything. I was sitting at my desk post eating a couple of sour lemon fruit candy candies from a bag." },
            { name: "Kamran", type: "Innocent", text: "I spent the entire evening weighing raw quartz mineral stone samples using the high-precision digital analytical scale." },
            { name: "Aila", type: "Innocent", text: "My job was just running the barcode printer machine to make identification sticker labels for the new crystal boxes." },
            { name: "Nabeel", type: "Innocent", text: "I was strictly tasked with adjusting the metal wire support stand positions inside the geology display glass rows." }
        ]
    },
    39: {
        crime: "Microprocessor Theft", place: "The Microchip Clean Lab",
        clue: "A prototype computer chip went missing, and a small fragment of blue ballpoint pen plastic was dropped in the dock tray.",
        suspects: [
            { name: "Javed", type: "Criminal", text: "I pressed way too hard on my cheap blue plastic pen while writing down the chip test values, and the plastic casing snapped in half." },
            { name: "Rania", type: "RedHerring", text: "I didn't use a pen. I was marking the cleanroom plastic equipment bins using a thick, blue ink permanent marker stick." },
            { name: "Shehzad", type: "Innocent", text: "I spent my hour staring through a high-magnification desktop microscope monitor to check the gold circuit traces." },
            { name: "Bushra", type: "Innocent", text: "My job was just counting the sterile silicon wafer disks inside the protective vacuum-sealed plastic storage container boxes." },
            { name: "Adnan", type: "Innocent", text: "I was over by the back wall grid replacing the air filter screen panels on the main cleanroom particle extractor unit." }
        ]
    },
    40: {
        crime: "Historical Treaty Theft", place: "The Document Archive Vault",
        clue: "An old leather-bound treaty book was taken, leaving traces of dried red clay mud sitting on the shelf velvet backing.",
        suspects: [
            { name: "Rizwan", type: "Criminal", text: "I brought some fresh red clay soil from the nursery yard to fix the broken pots of the indoor lobby plants." },
            { name: "Sobia", type: "RedHerring", text: "I was painting an old brick building design draft on a white canvas canvas sheet using a tube of dark red acrylic paint." },
            { name: "Jawad", type: "Innocent", text: "I spent the afternoon scanning old legal treaty papers and uploading them into the digital archive cloud server files." },
            { name: "Maira", type: "Innocent", text: "My job was just bundling the ancient business ledger books together using thick brown cotton packaging ropes." },
            { name: "Khurram", type: "Innocent", text: "I didn't even open a cabinet. I was just brushing a layer of dust off the upper wooden document racks with a feather duster tool." }
        ]
    },
    // LEVELS 41-50
    41: {
        crime: "Diamond Tiara Robbery", place: "The Grand Exhibition Hall",
        clue: "The tiara case was unlocked, leaving a distinct smell of burning vanilla scented wax sticks in the air.",
        suspects: [
            { name: "Saqib", type: "Criminal", text: "I was melting a stick of vanilla-scented sealing wax over a small flame to stamp the official envelope packages." },
            { name: "Momina", type: "RedHerring", text: "I was heating up a fresh batch of sweet vanilla cream biscuits inside the staff room microwave oven cooker." },
            { name: "Zeeshan", type: "Innocent", text: "I spent hours spraying clear alcohol liquid cleaner onto the large glass crystal light chandeliers hanging from the ceiling." },
            { name: "Natasha", type: "Innocent", text: "My job was just arranging the decorative steps of black velvet cushions inside the primary corner showcase showcase." },
            { name: "Irfan", type: "Innocent", text: "I was sitting at the entrance desk matching the barcode numbers on the incoming exhibit inventory list sheet prints." }
        ]
    },
    42: {
        crime: "Crypto Network Node Hack", place: "The Router Room Core",
        clue: "A server link went offline, and a wrapper fragment of intense peppermint gum was found stuck right behind the router box.",
        suspects: [
            { name: "Khizar", type: "Criminal", text: "I had a massive headache and a stale taste, so I was chewing some powerful mint gum strips to help me focus on my data entry logs." },
            { name: "Sehrish", type: "RedHerring", text: "I didn't chew gum. I was sipping hot organic spearmint leaf tea out of my thermal insulated metal travel travel mug cup." },
            { name: "Waleed", type: "Innocent", text: "I was running long yellow optical fiber connection wires along the main wall routing tracks and server rack grid loops." },
            { name: "Hina", type: "Innocent", text: "My task was just clearing the old system temporary files and cache folders out from the master terminal database storage." },
            { name: "Rameel", type: "Innocent", text: "I spent the last two hours typing numbers onto vinyl adhesive sticker tape and labeling the network patch panels." }
        ]
    },
    43: {
        crime: "Master Passcard Pickpocket", place: "The Admin Office Suite",
        clue: "The security pass was pulled from a desk drawer, leaving a tiny strand of bright purple wool yarn fiber on the mesh chair.",
        suspects: [
            { name: "Zafar", type: "Criminal", text: "The office was quiet, so I sat in the lounge corner using a crotchet needle and a ball of violet wool yarn to make a small hat." },
            { name: "Ayla", type: "RedHerring", text: "I didn't touch any wool yarn! I was using a bright neon purple highlighter felt pen to mark the urgent client names on the printouts." },
            { name: "Fiaz", type: "Innocent", text: "I spent my morning printing out the new employee registration registration forms on the main office laser printing deck machine." },
            { name: "Kanza", type: "Innocent", text: "I was over by the sorting bins clearing out a huge jam of shredded paper strips stuck inside the document destroyer machine input slider." },
            { name: "Arif", type: "Innocent", text: "My job was simply arranging the incoming paper mail files into proper chronological date slots inside the wall wooden mailbox rack." }
        ]
    },
    44: {
        crime: "Rare Mineral Stone Swap", place: "The Geology Showcase Suite",
        clue: "A valuable crystal was replaced with glass, leaving fine black graphite powder smudges on the glass locking safe dial.",
        suspects: [
            { name: "Shakir", type: "Criminal", text: "I was drawing engineering machine layouts on large draft sheets and used extra soft, dark graphite pencils to shade the lines." },
            { name: "Noreen", type: "RedHerring", text: "I was assigned to clean the dirty fireplace hearth in the back room and spent hours sweeping out the black wood charcoal soot ashes." },
            { name: "Jamil", type: "Innocent", text: "I spent my shift spraying streak-free optical cleaning liquid and wiping fingerprints off the display glass showcases windows panels." },
            { name: "Shiza", type: "Innocent", text: "My job was grouping the new raw stone mineral samples by their hardness metrics inside the velvet-lined grid partition cases." },
            { name: "Fahed", type: "Innocent", text: "I didn't even walk near the crystal safe. I was checking if the metal hinges on the secondary window security grills were tightly screwed." }
        ]
    },
    45: {
        crime: "Ancient Manuscript Theft", place: "The Archive Special Library",
        clue: "A priceless ancient scroll disappeared, leaving a strong smell of vinegar liquid chemical cleaner hovering over the workspace table.",
        suspects: [
            { name: "Mubashir", type: "Criminal", text: "The old oak table corner had white mold spots growing on the wood, so I mixed white vinegar with water to scrub the spots clean." },
            { name: "Sadia", type: "RedHerring", text: "I didn't clean anything. I was sitting at the lobby front reception counter eating a loud foil bag of salt and vinegar potato chips snacks." },
            { name: "Zain", type: "Innocent", text: "I spent the entire shift entering the historical book code names into the library's local desktop asset tracking software app." },
            { name: "Aqsa", type: "Innocent", text: "My only task was checking the digital humidity gauges inside the preservation room to make sure the air didn't get too damp." },
            { name: "Haroon", type: "Innocent", text: "I was simply placing sheets of special acid-free white spacer papers between the delicate pages of the legal manuscript files." }
        ]
    },
    46: {
        crime: "Historical Replica Swap", place: "The Central History Vault",
        clue: "An enchanted crown replica went missing, leaving faint white chalk mark lines on the edge of the showcase stand track.",
        suspects: [
            { name: "Rizwan", type: "Criminal", text: "I was using a chunky white chalk marker block to draw positioning boxes down on the floor tiles for the new display cabinet layout." },
            { name: "Amina", type: "RedHerring", text: "I accidentally dropped my gym bag onto the side bench desk, and a container of white baby powder popped open and spilled everywhere." },
            { name: "Zahid", type: "Innocent", text: "I spent hours using a magnifying lens glass to check if the serial numbers were correctly engraved inside the replica ring bases." },
            { name: "Sana", type: "Innocent", text: "My job was just adjusting the angles of the small overhead metal spotlight lighting brackets to make sure the panels looked bright." },
            { name: "Mustafa", type: "Innocent", text: "I was strictly assigned to clean dust layer formations off the red velvet insert pads inside the spare storage boxes in the back corridor." }
        ]
    },
    47: {
        crime: "Secret Business Strategy Raid", place: "The Executive Corner Suite",
        clue: "A top-secret company expansion map went missing, leaving sticky drops of sweet yellow honey beneath the broken cabinet drawer.",
        suspects: [
            { name: "Asif", type: "Criminal", text: "I had a terrible sore throat before the morning meeting, so I stirred two drops of liquid honey into my herbal lemon cup drink to help my voice." },
            { name: "Rubab", type: "RedHerring", text: "Don't look at my snacks! I was busy slicing up a fresh ripe yellow mango fruit into a small glass bowl for my afternoon meal break." },
            { name: "Faraz", type: "Innocent", text: "I spent my time filing the corporate registration tax declaration sheets inside the heavy metal rolling suspension track drawer cabinets." },
            { name: "Kiran", type: "Innocent", text: "I was using a flat steel razor scraper tool to clear out old dried glue and adhesive tape leftovers off the workspace table surface boards." },
            { name: "Imran", type: "Innocent", text: "I didn't touch the drawer! I was setting up a brand new electronic desk digital clock calendar unit with a fresh pack of cell battery replacements." }
        ]
    },
    48: {
        crime: "Router Card Theft", place: "The Main Network Block C",
        clue: "A primary server interface card was pulled, and the chassis area smells strongly of fresh orange rind fruit peel juice.",
        suspects: [
            { name: "Sajid", type: "Criminal", text: "I brought a bag of juicy sweet oranges to my workspace and was peeling them right over my keyboard station terminal during my breaks hour." },
            { name: "Tayyaba", type: "RedHerring", text: "The network frames had sticky residue, so I poured an industrial lemon citrus solvent liquid onto a rag to strip the old adhesive labels off." },
            { name: "Naeem", type: "Innocent", text: "I spent the entire afternoon tracking the flashing blue data connection link codes along the main server motherboard router rack grid loops." },
            { name: "Fiza", type: "Innocent", text: "My job was simple. I was utilizing a heavy canister of compressed air gas to blow fine dust layer accumulations away from the server heatsink fan units." },
            { name: "Basit", type: "Innocent", text: "I was stuck at my desk terminal logging system update maintenance ticket records inside the corporate central tracking application portal database." }
        ]
    },
    49: {
        crime: "Ancient Jade Figurine Swindle", place: "The Museum East Wing Vault",
        clue: "The artifact was replaced with painted stone, leaving traces of red clay soil sitting right on top of the velvet backing pad surface.",
        suspects: [
            { name: "Waqar", type: "Criminal", text: "The decorative indoor terracotta clay flower pots near the glass conservatory windows were leaking, so I spent hours putting fresh red soil into them." },
            { name: "Areej", type: "RedHerring", text: "I was working on a canvas art drawing sheet over in the creative room and was squeezing thick body red acrylic paint tubes out onto my design palette." },
            { name: "Noman", type: "Innocent", text: "I spent the shift using window spray bottles and clear wipes to remove greasy fingerprint smudge smudges off the museum display cabinet glass frames." },
            { name: "Sidra", type: "Innocent", text: "My task was just translating the ancient code writing script lines from the scroll text onto modern white descriptive paper tag labels for the wall mounts." },
            { name: "Javed", type: "Innocent", text: "I didn't enter the vault room. I was replacing the alkaline cell battery packs inside the secondary security backup alarm electronic lock boxes lockers." }
        ]
    },
    50: {
        crime: "The Master Diamond Loss", place: "The Grand Central Treasury Safe",
        clue: "The ultimate vault room was breached, and investigators discovered fine silver glitter dust flakes sitting on the main safe dial combination wheel.",
        suspects: [
            { name: "James", type: "Criminal", text: "My kid has a craft deadline, so I was sitting in the lounge gluing sparkling silver glitter sheet stars onto a cardboard solar system universe space map." },
            { name: "William", type: "RedHerring", text: "I wanted the room to look pristine for the visitors, so I was using a silver metal polish aerosol spray paste to shine up the grand ornamental trophy cups rows." },
            { name: "Noah", type: "Innocent", text: "I spent my full shift cross-referencing incoming product barcode tag listings with the digital tracking records ledger sheets on the corporate cloud system paths." },
            { name: "Daniel", type: "Innocent", text: "I was over in the reserve wing storage facility re-keying the cylinder padlock sets and iron safety latch blocks inside the backup high-security locker bins." },
            { name: "Emily", type: "Innocent", text: "My only assignment was aligning the protective red velvet layout cushions and custom presentation stands inside the front showcase display windows track paths." }
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
    let caseData = masterLevels[currentLevel] || masterLevels[1];

    let temporarySuspectDeck = [];
    let allocatedCriminalName = "";

    // Shuffle the suspects list so they appear in different box order on every load
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

    let briefDescriptionHTML = `🚨 <b>INCIDENT PROFILE:</b> <b>${caseData.crime}</b> inside <b>${caseData.place}</b>!<br><br>` +
                               `🔍 <b>FORENSICS HINT:</b> ${caseData.clue}<br><br>` +
                               `<i>Detective Warning: Don't guess. Read carefully to find who naturally caused this trace trace!</i>`;

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
