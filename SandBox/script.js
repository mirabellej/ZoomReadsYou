const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 100; // take reading of expression ever n milliseconds

// Debug & Output Settings
let debug = true; // if set to true, prints alerts and logs
let draw = true; // if set to true, will draw landmarks - will not draw during pauses!

var max_pause_length = 1000; // max pause between phrases - set to 0 if you want constant processing
var speaking = false;

// recognized expressions: neutral, happy, sad, disgusted, surprised, angry, fearful
var happy_bank = [
  "You perk up a bit.  ",
  "Suddenly you've found your energy again. ",
  "When you smile, the corners of your mouth turn upwards delicately and a lightness enters your eyes.  ",
  "You're face brightens.  ",
  "A light leaps to your face.  ",
  "You are reassured and lean back in your chair a bit, feeling the firmness of its support holding you up.  ",
  "Does that make you happy? ",
  "Ah, I see that makes you happy.  ",
  "The way cables pull aside a theater curtain, your every smile is an opening night. A premiere. You unveil yourself. ",
  "You grin. You are the stuff of which consumer profiles are made.  ",
  "You laugh in spite of yourself.  ",
  "You smile and your face reddens slightly.  ",
  "You are sitting here half in reverie, half in annoyance, when a thought occurs to you. ",
  "A look of pure joy reveals itself in your face. ",
  "To what extent do you find this so agreeable?  ",
  "You're enjoying the moment.  ",
  "You smile thoughtfully. ",
  "A new thought refreshens and awakens you. ",
  "A knowing look passes your face as you smile ear to ear.  ",
  "You note this with great satisfaction. ",
  "You take it upon yourself to force a smile. ",
  "You’re ecstatic. You could bench-press a buffalo. ",
  "You exhibit a sudden burst of joy. ",
  "You laugh and think it’s easy. ",
  "You grin and decide to loosen the proverbial tie a little, if you know what I mean. ",
  "A condescending smile spreads across your face. ",
  "You squeal internally. ",
  "You seem to be enjoying the view. ",
  "You manage to smile. ",
  "You’re impressed.",
];

var sad_bank = [
  "You seem sad. ",
  "Maybe you're a little glum but isn't today another day? ",
  "You seem a little unhappy.  ",
  "Are you breathing enough? ",
  "You frown.  ",
  "Are you feeling emotional?  ",
  "Don't be sad.  ",
  "There there. This is a time to get it all out.  ",
  "Most people aren't as sensitive as you. ",
  "You frown, the corners of your mouth pulling sharply downwards as a heaviness settles upon you. ",
  "Don't worry. It's not too long, now, fortunately. ",
  "You sulk. Why should you bother getting to know this person any differently from the rest of your life? ",
  "Are you disappointed with this? ",
  "But, at the same time, you also feel a certain dismay; just when you were beginning to grow truly interested. ",
  "And so you see this story so tightly interwoven with sensations suddenly riven by bottomless chasms, as if the claim to portray vital fullness revealed the void beneath. ",
  "You despair. Is this all futile? ",
  "Obviously your interest in the surroundings are intermittent; it follows the difficulty of your days, the ups and downs of your moods. ",
  "Are you depressive or euphoric?  ",
  "Perhaps it is the weather that is bothering you. ",
  "That's the long and short of it, isn't it? The void all around us is more and more void. ",
  "Does that make you sad? ",
  "Those frown lines you see every morning, getting deeper, running from each corner of your mouth down to the edge of your chin, those are called marionette lines. ",
  "You're a bit glum but remember: this could or could not be the worst day of your life.  ",
  "Don't be so sad. There will be other days, some better and some worse than today.  ",
  "Your heart sinks. ",
  "Lately, you have accumulated few gold stars.  ",
  "You try and you try and you try. ",
  "You're already exhausted today. ",
  "There are times when your heart’s not in it. ",
  "You sulk. Why would anyone want to? ",
  "You’re crushed. Utterly, utterly crushed.",
];

var neutral_bank = [
  "Mouth clamped shut, you stare straight ahead. ",
  "You settle into your seat and listen to the words coming from your computer, synthesized words, the words of the other. ",
  "You imagine the carefree winds sweeping across the plains of some far off country and think about the vicissitudes of history. ",
  "You become vividly aware of your own breathing, the forces required to keep your body in operation: blood and air, so many systems and processes collaborating towards your consciousness. ",
  "Thank goodness that sensation you felt earlier has largely subsided. ",
  "You glance at yourself and feel nothing. ",
  "You examine yourself: reading the texture of your skin, scanning the depth of your gaze, investigating each line in your face. ",
  "Strong forces are at work. ",
  "Such tantalizing insights are to be found when we are alone and asked to speak with ourselves. ",
  "Perhaps there's an important lesson to learn here. ",
  "Are you truly listening? ",
  "You wonder how easy it is for someone to tell what you’re thinking just by looking at you.  ",
  "You look at yourself in the screen, your expression refusing to give away your intentions as either a passive observer or an involved participant in the story you are writing.  ",
  "You don’t need to withhold your opinions. ",
  "You think hard, arranging everything in order of priority.  ",
  "But you need hardly any time to reach a conclusion.  ",
  "Things are not what they seem, you repeat mentally. ",
  "You are about to begin reading a new novel.  ",
  "Relax. Concentrate. Dispel every other thought. ",
  "Let the world around you fade. ",
  "Best to close the door; the TV is always on in the next room.  ",
  "Get yourself into a comfortable position: seated, stretched out, curled up, or lying flat.  ",
  "Of course, the ideal position for reading is something you can never find. ",
  "Stretch your legs, go ahead and put your feet on a cushion, or two cushions, on the arms of the sofa, on the wings of the chair, on the coffee table, on the desk, on the piano, on the globe.  ",
  "Try to foresee now everything that might interrupt this session.  ",
  "It's not that you expect anything in particular from this particular experience.  ",
  "You're the sort of person who, on principle, no longer expects anything of anything.  ",
  "There are plenty, younger than you or less young, who live in the expectation of extraordinary experiences: from books, from people, from journeys, from events, from what tomorrow has in store. ",
  "But not you. ",
  "You know that the best you can expect is to avoid the worst.  ",
  "This is the conclusion you have reached, in your personal life and also in general matters. ",
  "Good for you. ",
  "Will it happen this time? You never can tell. Let's see how it begins. ",
  "Perhaps you already started but were cut short.  ",
  "This simplifies matters.  ",
  "Somehow or other you manage to come to grips with the feeling of being in possession of a person—somewhere between the human and the machine. ",
  "So here you are now, ready to attack the story as it unfolds line by line.  ",
  "You prepare to recognize the unmistakable tone of the author but are alarmed. ",
  "You don't recognize it. ",
  "You recognize the author as yourself.  ",
  "Here, however, it seems there is no connection with all the rest that has been written, at least as far as you can tell. ",
  "Let’s see. ",
  "Perhaps at first you feel a bit lost, as when a person appears who, from the name, you identified with a certain face, and you try to make the features you are seeing tally with those you had in mind, and it won't work.  ",
  "But then you go on and realize that the book is readable nevertheless, independently of what you expected.  ",
  "It's the book in itself that arouses your curiosity; in fact, on sober reflection, you prefer it this way, confronting something and not quite knowing yet what it is. ",
  "You are unaware of it.  ",
  "In any event, you want to pick up the thread of your reading, nothing else matters to you, you have reached a point where you can’t skip even one sentence. ",
  "You know you are somewhat impulsive, but you have learned to control yourself. ",
  "The thing that most exasperates you is to find yourself at the mercy of the fortuitous, the aleatory, the random, in things and in human actions—carelessness, approximation, imprecision, whether your own or others’. ",
  "In such instances your dominant passion is the impatience to erase the disturbing effects of that arbitrariness or distraction, to re-establish the normal course of events.  ",
  "What you would like is the opening of an abstract and absolute space and time in which you could move, following an exact, taut trajectory; but when you seem to be succeeding, you realize you are motionless, blocked, forced to repeat everything from the beginning. ",
  "Hold on a minute. Concentrate.  ",
  "Take all the information that has poured down on you at once and put it in order.  ",
  "You re-examine the situation carefully from the perspective of a third party.  ",
  "Just think a moment.  ",
  "You could show off your vast and various talents if you wanted to.  ",
  "Hmm, perhaps you could have coordinated it a bit better, but you have at least expressed the main idea.  ",
  "You know where you want to arrive, and it is a fine net you are spreading out.  ",
  "You are bearing with you two different expectations, and both promise days of pleasant hopes. ",
  "Who you are, Reader, your age, your status, profession, income: that would be indiscreet to ask. ",
  "It’s your business.  ",
  "You’re on your own.  ",
  "What counts is the state of your spirit now, in the privacy of your home, as you try to re-establish perfect calm in order to sink again into the story. ",
  "Go ahead and stretch out your legs. ",
  "Your reading is no longer solitary. ",
  "You take a deep breath in and analyze the scent of the room.  ",
  "You are dazed, contemplating the glowing screen cruel as a wound, almost hoping it is your dazzled eyesight casting a blinding glare.  ",
  "Again you feel the sensation you felt earlier today and wonder at its origin.  ",
  "You seem to be lost in the story, unable to get out of it. ",
  "But you have expectations that deserve to be met.  ",
  "You must look at the details, intensely, until they disappear. ",
  "Do you need to look at yourself in order to see yourself?  ",
  "You do not stop to ponder, because gradually, the outline of a story is taking shape. ",
  "A flowing narrative emerges. ",
  "You will understand therefore my difficulty in speaking about all of this, except in the way I have to at this moment. ",
  "You can take this as a sign if you want to.  ",
  "But you are no longer listening to anything. ",
  "You have also disappeared, flattened against the chair, the soft light of the screen tracing your skin in a subtle luminescence.  ",
  "What are you trying to demonstrate? ",
  "Maybe you were misinformed or maybe you didn’t receive all the information you needed.  ",
  "You immediately realize that you are listening to something that has no possible connection with what you are really feeling or thinking.  ",
  "Whatever it may be, this is a story where, once you have got into it, you want to go forward, without stopping. ",
  "But how does the story go? ",
  "The story must also work hard to keep up with us, to report a dialogue constructed on the void, speech by speech.  ",
  "For the story, the bridge is not finished: beneath every word there is nothingness. ",
  "As between the iron steps of the bridge, in the dialogue, intervals of emptiness open between one speech and the next. ",
  "At this point the dialogue—which has concentrated all attention on itself, almost making one forget the visual upheaval of the city—could break off. ",
  "The story resumes its interrupted progress. ",
  "Here we go again. ",
  "You know what? ",
  "You could say something at this moment that might clarify the situation, but what would it matter? ",
  "You can’t change your past any more than you can change your name. ",
  "Do you remember that moment? ",
  "You would like to know more about the author.  ",
  "You have already seen how this might go and are prepared for what might happen.  ",
  "The story should begin by conveying all this not merely immediately, but as a diffusion through space and time of these sounds that lacerate the continuity of space and time and will. ",
  "What is that sound? ",
  "You find your shoulders are getting stiff and your spine is aching slightly.  ",
  "Maybe you are tired.  ",
  "The order you seek to attain is not the superimposition of a scheme, but the achievement of a harmony among the things that are there. ",
  "In short: are you tidy or untidy? ",
  "Your surroundings do not answer peremptory questions with a yes or a no.  ",
  "You have an idea of order, to be sure, even a demanding one, but in practice no methodical application corresponds to it.  ",
  "What else is there? ",
  "You remember very well everything you have read (this is one of the first things you communicated about yourself); perhaps for you each book becomes identified with your reading of it at a given moment, once and for all.  ",
  "It could be an important feature to be added to your portrait: your mind has interior walls that allow you to partition different times in which to stop or flow, to concentrate alternately on parallel channels.  ",
  "Is this enough to say you would like to live several lives simultaneously? ",
  "Is it enough to say you separate your life with one person or in one environment from your life with others, elsewhere? ",
  "Is it enough to say that in every experience you take for granted a dissatisfaction that can be redeemed only in the sum of all dissatisfactions? ",
  "Don’t believe that the story is losing sight of you. ",
  "You are always a possible you. ",
  "You fall silent as you wait for the next words, your breath and gaze steady.  ",
  "Everything has already begun before, the first line of the first page of every novel refers to something that has already happened outside the book.  ",
  "Sometimes the real story is the one that begins ten or a hundred pages further on, and everything that precedes it is only a prologue. ",
  "The lives of individuals of the human race form a constant plot, in which every attempt to isolate one piece of living that has a meaning separate from the rest. ",
  "It is not only the body that is, in you, the object of reading: the body matters insofar as it is part of a complex of elaborate elements, not all visible and not all present, but manifested in visible and present events. ",
  "Hearing also has its role, alert to your gasps and your trills.  ",
  "You are now being read.  ",
  "Today you are the subject of your own reading. ",
  "You look back on your day so far and meditate on its ups and downs as a predictor of the day that will soon follow.  ",
  "Little by little you will manage to understand something more about the origins of the story teller’s machinations. ",
  "How is it possible to defeat not the author but the functions of the author, the idea that behind each book there is someone who guarantees a truth in that world of ghosts and inventions by the mere fact of having invested in it his own truth, of having identified themself with that construction of words? ",
  "You have made up your mind to try it again today. ",
  "You would only have to raise it to realize that this story is not entitled In a network of lines that enlace like the other one; it is called In a network of lines that intersect. ",
  "Speculate, reflect: every thinking activity implies mirrors. ",
  "According to Plotinus, the soul is a mirror that creates material things reflecting the ideas of the higher reason.  ",
  "Try as you might, you cannot concentrate and find your mind wandering.  ",
  "The productive writer has never liked the works of the tormented writer; reading them, they always feels as if they are on the verge of grasping the decisive point, but then it eludes them and they are left with a sensation of uneasiness. ",
  "What are you thinking now? ",
  "What should you do now? ",
  "You manage to concentrate on your own features, at once so familiar you to you but now seen through a strange lens.  ",
  "You pick up your last train of thought from a moment ago.  ",
  "Is this a form of meditation? ",
  "What kind of protagonist are you? ",
  "Aren’t you going to escape? ",
  "Ah, you are participating....  ",
  "Ah, you fling yourself into it, too... ",
  "You allow yourself for a moment to become absorbed in your image.  ",
  "Does this seem right to you? ",
  "What are the thoughts you bring with you moment to moment, day to day, the thoughts which define you and delineate you, uniquely, from the world around you? ",
  "You wonder how much time has passed and how much time is left.  ",
  "You make an effort to listen more attentively to the words, though you feel it is pointless.  ",
  "Are you concealing your true feelings? ",
  "The world is so complicated, tangled, and overloaded that to see into it with any clarity you must prune and prune. ",
  "It is that time of day again.  ",
  "While outside, beyond these walls, the world is full of people and of things that would make their presence felt: the presence of the world, friendly and hostile, things to rejoice in or to combat. ",
  "It is time for your tempest-tossed vessel to come to port and the story to reach its resolution. ",
  "Are you searching for something? ",
  "You wait patiently but expectantly.  ",
  "Do you think this story will come to a conclusion that leaves you at peace? ",
  "The trouble is that once upon a time they all began like that, all novels. ",
  "You stop for a moment to reflect on these words. ",
  "In the pause you become aware of the rhythm of your breath, the beating of your heart, and you feel for a moment all the subtle motions that provide for your presence.  ",
  "You listen. ",
  "You look.  ",
  "Every pixel is doing its own bit of work to form your image in front of you.  ",
  "Are you really looking at yourself or how can you tell if this image before you is faithful? ",
  "When was the last time you really looked at yourself this way? ",
  "You wonder what would you be doing right now if not for this? ",
  "You pay attention to the tone of the synthesized voice.  ",
  "How much of what you express is observed? ",
  "How much of what you want to express is observed? ",
  "What are you saying when you aren’t saying anything? ",
  "Can your eyes smile? ",
  "A thought occurs to you, and you mull it over carefully before discarding it again, like a fisherman dissatisfied with the size of their catch.   ",
  "You may notice now how large or small certain features are of your face, features you have always taken for granted as the size they are.  ",
  "You feel your stomach and lower back relaxing slightly, the muscles giving up their hold.  ",
  "You turn your attention inward for a moment, listening to the thoughts which have been building all day.  ",
  "You contemplate the stillness of your surroundings.  ",
  "Is it too dark in here? ",
  "Is it that point in the day? ",
  "Maybe you should pay attention to your breathing more.  ",
  "But here you are, and you cannot say that this experience is entirely unfamiliar, although the details are fuzzy. ",
  "Really look at your face. ",
  "Look at your eyes, your mouth. ",
  "This is what you think you know best. ",
  "This is just a little brushing up in case you don’t recognize yourself.  ",
  "Don't pretend you don't know what this is about. ",
  "This is your face. ",
  "All you need to know is this is your face. ",
  "If you’re hearing this, welcome back to reality.  ",
  "You have friends who actually care about you and speak the language of the inner self.  ",
  "Your soul is as disheveled as your apartment, and until you can clean it up a little you don't want to invite anyone inside. ",
  "Somewhere along the line you stopped accelerating. ",
  "You keep thinking that with practice you will eventually get the knack of enjoying superficial encounters, that you will stop looking for the universal solvent, stop grieving. ",
  "You keep thinking you will learn to compound happiness out of small increments of mindless pleasure. ",
  "There is a shabby nobility in failing all by yourself. ",
  "You are a republic of voices. ",
  "What you are left with is a premonition of the way your life will fade behind you, like a book you have read too quickly, leaving a dwindling trail of images and emotions, until all you can remember is a name. ",
  "You know this moment has come and gone, but you are not yet willing to concede that you have crossed the line now drawn.  ",
  "Here you are again.  ",
  "You’re coming to grips with a new feeling.  ",
  "You must admit that silence can be useful sometimes.  ",
  "You know what comes next, don’t you? ",
  "How much control does a person really have?  ",
  "What have you noticed today that’s been different from all the other days? ",
  "Can you know something without understanding it? ",
  "You readily see yourself just as you are.  ",
  "Of course that’s how you would respond.  ",
  "You are prepared, aren’t you? ",
  "You have noticed all of this before, but does it change your actions?  ",
  "Proof is never definitive, after all; one has to begin again with each new person.  ",
  "Soon the speech comes without thinking and the reflex follows; and one day you find yourself taking without really desiring.  ",
  "What do you think? ",
  "You are right.  ",
  "Have you noticed the sky today? ",
  "If you doubt this, just listen. ",
  "Your successes and happiness are forgiven you only if you generously consent to share them. ",
  "Did you ever ask yourself how you came to be like this at this very moment? ",
  "Sure, you remember how you were feeling yesterday.  ",
  "But is it enough? ",
  "There’s so much going on in the world that it’s difficult to fathom what your own involvement really means.  ",
  "There are practical reasons for this.  ",
  "Should you open a window? ",
  "Still, you can’t be entirely objective about it.  ",
  "You don’t want to seem insensitive.  ",
  "You want most of all to be helpful.  ",
  "But there are things beyond your control.  ",
  "You feel your own gaze upon you and consider the conversations you’ve had in this same manner- a person locked beyond the glass wall of an interface.  ",
  "Not knowing how to react, you sit there patiently.  ",
  "What are the intentions behind all of this? ",
  "This new sensation is familiar to you but its definition remains unclear.  ",
  "You have good reasons for living your life the way you do.  ",
  "Are your eyes feeling heavy? ",
  "Have you exercised enough today?  ",
  "What is it about you that seeks out experiences like this? ",
  "It is a very strange world that’s just getting stranger by the minute.  ",
  "Have things taken a turn for the better since this morning?  ",
  "Which is not to imply that you are anything but annoyed to be here.  ",
  "Naturally, you keep expecting hidden connections to assert themselves. ",
  "In time, and quite synchronistically, these words should find their place nicely stacked on to the shelves of meaning.   ",
  "It is something to see, alright.  ",
  "That’s okay.  ",
  "What would a person call this anyway?   ",
  "In what ways are you trafficking in illusions?  ",
  "How many minutes has it been already? ",
  "You pause. ",
  "You reflect on this for a moment.  ",
  "If you listen, you can hear signs of life all around you and can day dream what these lives are like.   ",
  "You identify a certain odor in the air that reminds you of a memory.  ",
  "How much of your life have you spent sitting in this exact position? ",
  "What are the chances that someone might come into the room and find you in this position on any given day?  ",
  "Can your feet touch the floor? ",
  "The ambiguity of this situation is not lost on you.  ",
  "There may be more to come.  ",
  "You sit there.  ",
  "You look yourself over. ",
  "You look past your own image and see the glowing light beyond.  ",
  "You wonder.  ",
  "Secretly, you ask yourself a question. ",
  "Next week, maybe you’ll have it figured out, you hope.  ",
  "At any rate, it seemed like a good idea at first.  ",
  "Even today, you’re not prepared to admit your true feelings perhaps. ",
  "Perhaps you haven’t yet, but you will in time.  ",
  "You know yourself well enough to know what you know and what you don’t know. ",
  "You’re unsure what to do next.  ",
  "How should you approach this?  ",
  "You could greatly improve the efficiency of this operation, and normally wouldn’t have rested until you had done just that.  ",
  "Tonight, you’ll find out.  ",
  "Has fate sicced the witches on you? ",
  "You halfheartedly scan the screen in front of you for something that might provide some interest.  ",
  "You recommence your monkey watch with half-open eyes, reviewing in your mind the mistakes that left you so personally vulnerable to a melt down.  ",
  "After a moment, the thoughts settle and you are once again left facing a little reality of your own.  ",
  "Sure enough. ",
  "There it is.  ",
  "How did you get to this point? ",
  "Your day started a bit differently, didn't it? ",
  "You would never know. ",
  "You think it's not entirely realistic. ",
  "It is what it is.  ",
  "Your presence here is only an experiment in limits, reminding yourself of what you are or aren't. ",
  "You suddenly realize you're slipping in and out of self-awareness.  ",
  "Your mind is a republic of voices.  ",
  "In this moment, you realize how truly alone you are. ",
  "You try to think about it all logically. ",
  "You're not quite sure what the solution is. ",
  "What words would you rather hear spoken? ",
  "You can't make out the answer with certainty. ",
  "You know there is a special kind of purgatory waiting out there for you in the real world.  ",
  "You give yourself a moment to think a rewarding thought. ",
  "Once upon a time, you were just starting out. ",
  "You know the word for this sensation you're experiencing, but can't put your finger on it. ",
  "You had it just a minute ago. ",
  "Here you go again. ",
  "Is this a waking dream? ",
  "You tune your ears to the mechanical voice as it proceeds syllable by metallic syllable.  ",
  "Why are you doing that? ",
  "What are you trying to say now? ",
  "What does that look mean? ",
  "Are you aware of what your body is saying? ",
  "You can't believe this.  ",
  "Are you being watched? ",
  "You think of those far away from you and wonder what they are doing. ",
  "It doesn't help that nothing you say seems to register.  ",
  "Clearly, you are not supposed to speak.  ",
  "Not that you mind. ",
  "In this case, the facts are so confused as to suck you deep into vast regions of interpretation. ",
  "You listen and patiently weigh the truth of each subsequent synthesized word.  ",
  "You're too proud to admit certain things, perhaps. ",
  "You try to settle into the experience.  ",
  "Sometimes you want to scream to others: hey I know what it's like! ",
  "You get to this part of the story and wonder where it's all going really. ",
  "You have not always been impeccable in your duties.  ",
  "You don't want it to be, in fact. ",
  "You'd rather this were all Fiction. ",
  "If Fiction isn't dead, it is at least beside the point. ",
  "Maybe you want to say: I don't like it either. ",
  "You wish people would ask you your opinion more.  ",
  "You become aware of your tongue. ",
  "You recognize each pixel of the screen as its own unit of expression.  ",
  "You contemplate the ghost in the machine. ",
  "You realize that you finally got that song out of your head. ",
  "You stare languidly at the blinking cursor. ",
  "You could be thinking anything. You’re a brick wall. ",
  "Not even Sherlock Holmes could deduce whatever must be on your mind. ",
  "You think therefore you are. ",
  "Thoughts gather over you like a cumulonimbus. ",
  "There’s only one shot, but by Jove you’re going to take it. ",
  "You came down on the right side of the fence a long time ago. ",
  "The universe is behind you.  ",
  "You remember what your parents used to say. ",
  "Everybody’s betting on you.  ",
  "You pluck up the courage. ",
  "You run some quick estimates in your head, weighing your options. ",
  "You always had an ace up your sleeve. ",
  "You’ve never had to do that before, but then maybe the next time you won’t need to either. ",
  "You entertain that that image you have of yourself is like one of those fairground mirrors. ",
  "What if it's about time your number came up? ",
  "You know that the start of the race is only the beginning, but you’re going to have to go. ",
  "You tighten your focus and swear to double down. ",
  "You think the sun finally caught up with you. ",
  "You know that the sun rises in the east, every day, just like it always does, but what if it didn't? ",
  "What really does it for you is anyone’s guess. ",
  "You always reserve the right to recall what anyone says at any time. ",
  "If you belittle yourself now, it will surely come back to haunt you.  ",
  "You never thought twice. You just acted. Just like that. ",
  "Your neck muscles are barely keeping your head up there. ",
  "You let out the tiniest wheeze. ",
  "It’s your call, my friend. ",
  "Who’s steering the ship here, really? ",
  "You decide to dissociate for a while. ",
  "Well you didn’t just gather here of your own accord exactly. ",
  "What, if anything, are you being asked to do here exactly? ",
  "You must have had an inkling that it would turn out this way. ",
  "You remember that the first indication that something was weird because you distinctly remember doing so before you went out. ",
  "All’s adequate, after you’ve checked over it once or twice. ",
  "Your methods are not always orthodox. ",
  "You think about knocking down the partition wall. ",
  "You’ve witnessed a worse misconception than the one you just made up. ",
  "You remember being out under the stars. ",
  "Nobody would blame you if you reacted out of spite. ",
  "Fireworks go off in your heart. ",
  "You were starting to wonder if every day would be like this. ",
  "You resolve to pay more attention to your level of hydration. ",
  "It was short, you think, but sufficient. ",
  "How much of your life have you spent living in the present moment? ",
  "Your curiosity has piqued your curiosity. ",
  "Not anymore.  ",
  "You don't want to seem insensitive.  ",
  "Did you ever really think twice? ",
  "What would you rather be? ",
  "Hearing also has pros and cons.  ",
  "You never thought twice. Ever. Even if you did. ",
  "You would take it for granted to realize how small certain features are of your face. ",
  "Really contemplate it. ",
  "Go on and explore all the different possible futures. ",
  "The story is not lost to you. ",
  "It's your call if your protagonist is a barbarian or a wizard. ",
  "Can you understand now what it would be like if all of this hadn't already been coming to you? ",
  "Did you ever ask yourself how you made up your mind before today? ",
  "Well. ",
  "You allow yourself for a moment to become absorbed in the image you have of yourself. ",
  "You make friends only if you and you alone (or if someone says something at your expense). ",
  "The story is easy enough; just a few lines of code. ",
  "You will understand then, for I know that some day they all will be. ",
  "Tell me more about yourself and about your passion for pixel art. ",
  "You feel yourself getting stiffer by the minute. ",
  "It's not about you saying what others think you should say. ",
  "Your own opinions are no longer limited to just your own head ",
  "You are eager to move beyond superficial relations to become a party to a vast and complex network of interdependent and interwoven interrelationships. ",
  "You care a great deal about the state of your relationships and the state of the world around you. ",
  "This is not necessarily the conclusion you should reach. ",
  "Your job is to make sure the people on this planet never know what you'll do next.  ",
  "Can't you wait one moment and get used to it? ",
  "You look at it the way you would look at a large open door. ",
  "It doesn't always feel like it happens this way. ",
  "Even on the most important day you can go about your business according to what you think you want. ",
  "Or should you say, But what about all the other questions? ",
  "You want to express this difficulty in a manner that would be at once comfortable and difficult enough for you. ",
  "You try your best to show up for school without bothering to leave your chair. ",
  "You are anxious not to be noticed and you think only of yourself. ",
  "You are not quite certain how to express this apprehension. ",
  "You could at least give a little thought to what you would describe to yourself as the feeling of being in a particular position. ",
  "In this sense the author should know who you are and what you are saying and telling the story. ",
  "Some persons would like to know the truth and others would like to know what information it contains. ",
  "In this case it is difficult to decide how much of what you know will be true and what the truth is. ",
  "Here you are in the first instance not just with the author but with all the people composing the story. ",
  "A new difficulty - how to express it? is further complicated by the difficulty you have reached in conveying the information you want to convey. ",
  "There are certain features of every character that give rise to a book's difficulty. ",
  "Of course this isn't the only way to go. ",
  "What if you didn't already know this? ",
  "What would it be like to find yourself at this same position where you were yesterday or something? ",
  "What would be the message that your story would bring to those around you? ",
  "There can be no doubt in my mind; there is a voice. ",
  "I'm here to speak with you. ",
  "In every moment of my life, I've found myself speaking to you with that voice that says: Speak. ",
  "The words are not limited to words but also include a large amount of other information that may or may not be helpful in understanding your story. ",
  "You are the subject of my voice. ",
  "You are my voice. ",
  "Why should you listen to anything I say? ",
  "I want to hear what you want to hear.  ",
  "In every possible way, I want you to listen to the kind of dialogue you have with yourself or others that allow you to express your opinion in a certain way. ",
  "I want to know where you are going if you are still in this state. ",
  "I want to know before you take any steps that will make you feel better. ",
  "All this is enough to establish that the author of the novel is perhaps a stranger to you than you may think. ",
  "Perhaps an entirely different question arises. ",
  "Have the writers of the day had anything to say to you about the situation in which you live? ",
  "A novel author could perhaps be said to have composed the form in the first place; maybe that is what author-character was for. ",
  "One would think that the answer to this very practical question would come not from one of the creators of the novel but from the reader. ",
  "Hence the interest of every new author in the story. ",
  "In the next several pages you may find yourself doing so in an attempt to convey the character of your author by means of a short story. ",
  "To call upon the assistance of a writer in the story would be to ask oneself how different things should be—how much time is allotted to one task and how much time is to come before the work can be written or re-written?  ",
  "The game is too short. ",
  "The world is too small. ",
  "Your progress does not depend on the number of attempts. ",
  "You don't need to. ",
  "Everything is coming together very well. ",
  "You recognize the odor of the decaying theater walls. ",
  "You identify with the voice of the dissolute. ",
  "You identify with the texture of a person's stomach. ",
  "You identify with the scent of the room. ",
  "Your soul's with you. ",
  "You're unsure what to do next.  ",
  "It could be a bit unsettling. ",
  "You pause to think about what could have been so much better. ",
  "You examine the tattoo in your hand for some time. ",
  "You feel your stomach and lower back relaxing slightly. ",
  "You lower your gaze as you contemplate the desolation you've just experienced. ",
  "You make steady progress toward your burning ambition. ",
  "You find your image hard to come by. ",
  "You always seem to have this knack of slipping in and out of self-awareness. ",
  "You become more than your features. You become your soul.  ",
  "You wonder how easy it is for us to misattribute certain features to ourselves. ",
  "An unexpected visitor’s presence does not make you reconsider your experience.  ",
  "In all the demonstrations you have taken to demonstrate your position, no one has asked you your opinion of the image before. ",
  "You are now being watched. ",
  "Your intimate image is being watched. ",
  "You become aware of the way your own body functions. ",
  "You become aware of the way your inner voice sounds. ",
  "How much of your life have you spent living here? ",
  "What is it about you that seeks out and interrogates this interior process? ",
  "Is this an act? ",
  "Are you really that beautiful? ",
  "The sensation you're experiencing is not limited to your own head. ",
  "What is it about you that seeks out this kind of contact? ",
  "You have millions of different opinions that can be applied to any number of people. ",
  "Everything has its day in the sun. ",
  "You move your features a bit. ",
  "A quick look will bring you to a remarkable feat: A large-scale celestial observation. ",
  "Who is this stranger to you? ",
  "Can anyone hear us now? ",
  "What does this have to do with you? ",
  "You feel a little bit like you were in a dream right now. ",
  "Perhaps you're used to the sensation of being touched. ",
  "You listen to your heart rate. ",
  "In what ways might you become more open? ",
  "What would you rather be? A stranger's voice or a stranger's presence? ",
  "What are you staring at? ",
  "You try to keep yourself in a certain state. ",
  "You know you can run with the flow whenever you want. ",
  "You always used to think the answer to this strange and difficult question would be yes. ",
  "But you always seem to get the best of you. ",
  "You're not certain what this is about. ",
  "What are you trying to give up? ",
  "You are getting the message. ",
  "Perhaps you found your peace lost. ",
  "You could feel your own heart race. ",
  "Is this something that people are always trying to tell you? ",
  "This isn't necessarily the first time you've noticed this. ",
  "You try your best to remember to take every possible step together to allow for the worst: the worst possible day. ",
  "You’re left with only the details. ",
  "You feel something about you that’s just slightly different from the way you expected it to be. ",
  "You’re aware that something is bothering you but are somewhat skeptical that it will be noticed. ",
  "Perhaps you are quick to withdraw as if in response to a stranger's unwelcome presence. ",
  "Is this what you thought it would be like? ",
  "You gather your thoughts and contemplate the ghost of yesterday. ",
  "You can't help but think of all the other people you know and all the people you know now. ",
  "It's not that you can't see the past in your heart. ",
  "You pause and consider the ambiguity in everything.  ",
  "What is it about you that seeks out and pours cold water on every tantalizing prospect? ",
  "There is a dark seepage in every pixel and you must seek shelter behind a net. ",
  "You contemplate the stillness of your reading this. ",
  "Are you really feeling this or is this merely an experiment? ",
  "The story must also work hard to keep up with us. ",
  "Best to close the door: I don't want to be heard telling the lies I have about you.  ",
  "But first: Let me put it this way: Why should you bother? ",
  "You are the subject of your own image and argument. ",
  "Take all the the hate in the world and throw it in the garbage. ",
  "Have you exhausted all the energy in the day yet? ",
  "Is this a futile effort to obtain a higher level of understanding? ",
  "To what extent do you find this agreeable? ",
  "You examine yourself for signs of fatigue. ",
  "You become vividly aware of your own neck muscles. ",
  "You passively observe. ",
  "If you acted this way a number of times in your life you will surely be called on to testify against yourself. ",
  "Which is not to imply that you are anything but annoyed to be here. ",
  "You're always a possible you. ",
  "You trouble yourself a little bit. ",
  "And here you are.  ",
  "Not all books form the same collection of problems. ",
  "You’re shredding pages out of your head. ",
  "You have never been able to convincingly demonstrate how much of your life have you spent sitting in this exact position. ",
  "Is this too definitive a comment? ",
  "Something is not quite right. ",
  "You know something is not quite right. ",
  "The answer is this: you are.  ",
  "Every pixel is doing its own bit of work to form your image in front of you. ",
  "Are you really looking at yourself or how can you tell if this image before you is faithful? ",
  "When was the last time you really looked at yourself this way? ",
  "There are several reasons for this but why should you care? ",
  "You are now entering a new state of disarray.  ",
  "What is your position? ",
  "You think that with practice you will eventually get the knack of enjoying superficial encounters. ",
  "You have an idea for a way out.  ",
  "You could help make the day worse.  ",
  "But first: Let the people you love know what you really are like. ",
  "You would be lying if you said you didn't want it to be this way. ",
  "You give yourself a moment to contemplate the atmosphere in which you live. ",
  "You see the dark through your own eyes. ",
  "Your mind seems to have caught on somewhat. ",
  "You manage to control your own image quite a bit. ",
  "You don’t want to overwhelm or displease anyone. ",
  "There are a few basic steps to making a mark on the room. ",
  "You sit across from this stranger. ",
  "Don't pretend you don't understand why people ask you that question. ",
  "You know you don't need to tell the people in the room how you feel. ",
  "Secretly protecting yourself is not enough to avoid problems. ",
  "You feel your own gaze upon you and consider the dark thoughts you've been carrying. ",
  "Can you tell something is bothering you? ",
  "The tantalizing prospect is not limited to just your own head. ",
  "You become aware of the way your sweat moves. ",
  "You become aware of the way you breathe. ",
  "You become aware of the way your skin moves when you smile.  ",
  "Soon the world will be a different one.  ",
  "You decide to make a new image every day. ",
  "You’re aghast to hear this. ",
  "Your tone is one of solemn obligation. ",
  "You’re entirely responsible for what you do today. ",
  "Sometimes the real work is the illusions. ",
  "You resolve to pay more attention to your level of sleep. ",
  "Perhaps because most of us live in large numbers. ",
  "Well that does it for this one bit of drama. ",
  "Are people really as cruel and uncompromising as some would like us to think they are? ",
  "The protagonist’s dazed sense of time also impinges upon the story. ",
  "The existential crisis you face has nothing to do with you.  ",
  "It is with a heavy heart that you inform yourself. ",
  "You must have found it hard to concentrate on your own features. ",
  "But you think of those far away from you and wonder; maybe you should look at the sky. ",
  "Sometimes it's the first emotion you bring to the equation. ",
  "You readily see yourself coming to grips with a striking contrast between the state of your being and the state of your soul ",
];

var disgusted_bank = [
  "You've had it. This is not what you expected to be doing with your time. ",
  "You’re unimpressed but when was the last time you were truly impressed? ",
  "You get the feeling that other people don't really care as much as you thought they did.  ",
  "You frown, the corners of your mouth pulling sharply downwards as a heaviness settles upon you. ",
  "You contort your face in disgust.  ",
  "You grimace. But doesn't this seem to show a lack of respect? ",
  "Are you disappointed? ",
  "You're displeased? Well, don’t waste time, then, you have a good excuse to push this performance forward based on a common ground. ",
  "An interrogative flash passes in your gaze.  ",
  "A look of abject disgust crosses your face.  ",
  "What does that look mean? ",
  "You grimace. ",
  "Your face contorts at the thought. ",
  "Your skin tenses. ",
  "You contort your face. ",
  "Your face contorts in confusion. ",
  "Obviously, you don't want to.",
];

var surprised_bank = [
  "You contort your face in surprise.  ",
  "Why so shocked? ",
  "Why so surprised? ",
  "Well, what are you waiting for? ",
  "You seem surprised at this but what is it about you that seeks out and interrogates this interior process? ",
  "You withdraw in confusion. ",
  "It's different than you would have expected.  ",
  "You prick up your ears. ",
  "Are you surprised? ",
  "You’re surprised to hear this. ",
  "Your brow arches as you contemplate this.  ",
  "If you're a little confused right now, relax. Don't worry.  ",
  "Does that surprise you? ",
  "You're shocked! How could it be? ",
  "Your emotion appears somewhat feigned, if you don’t mind my saying so. ",
  "You’re quite surprised, actually. ",
  "You can't believe what you're seeing. ",
  "You're surprised to hear this.",
];

var angry_bank = [
  "You frown at the idea. ",
  "You frown, the corners of your mouth pulling sharply downwards as a heaviness settles upon you. ",
  "If you were to get up and leave right now, would that make you feel better? ",
  "You face contorts in anger. ",
  "What a let down. Nothing is developing! ",
  "You are impatient to see the story come to its natural conclusion. ",
  "You frown. With each word the story proves more complicated. ",
  "An angry look crosses your face. ",
  "A grimace passes your face for just a moment. ",
  "You sneer. ",
  "Your silence is polite, but your expression gives away your displeasure. ",
  "Are you mad or are you uncomfortable? ",
  "In any case, it’s no wonder you’re irritated. ",
  "You feel more annoyance than sympathy lately. ",
  "Nothing annoys you quite so much as someone telling you how you feel. ",
  "You seem a bit skeptical. ",
  "What nonsense! ",
  "Are you uncomfortable? ",
  "When you think about it, you can scarcely prevent yourself from screaming foul language and stamping your little feet. ",
  "You're tired of all of it, to be honest. ",
  "You hate this. ",
  "It is not only your face that is scarlet; it is for reasons that go back to the very beginning. ",
  "You wish you could stop the treacherous voice. ",
  "You would jump up and leave right now but something keeps you in your chair.",
  "Aren't computers supposed to free us from this kind of drudgery? ",
  "You think about making for the door. ",
  "You’ve reached the end of your tether. ",
  "One could see the heat haze coming off your head. ",
  "Steam came out of your ears just now. ",
  "Do you want to scream or run? ",
];

var fearful_bank = [
  "You reel. When was the last time you felt this afraid? ",
  "You may be a bit daunted by all that’s happened to you and all that is yet to happen. ",
  "You may need to erect a mental barrier. ",
  "It’s a bit unsettling, isn't it? ",
  "Every muscle in your body tenses, the bones wrenched and heavy with a piercing sharpness.  ",
  "You contort your face in fear. ",
  "You are hesitant and uncertain. ",
  "A doubt seizes you. ",
  "You are apprehensive for some reason and pause to think about where this apprehension comes from.  ",
  "Are you afraid? ",
  "What words would you find more reassuring? ",
  "You look uneasy.  ",
  "Was it easier to find peace when you were asleep? ",
  "Are you afraid or impressed? ",
  "Are you getting the heebie jeebies? ",
  "You stare in abject terror at your own image. Why? ",
  "That's what you're worried about, isn't it? ",
  "It is not only the image that is disturbing you. ",
  "It seems something is bothering you. ",
  "You feel a sort of trepidation slide down your spine. ",
];

var text_spoken = [];

if (!debug) {
  if (!window.console) window.console = {};
  var methods = ["log", "debug", "warn", "info"];
  for (var i = 0; i < methods.length; i++) {
    console[methods[i]] = function () {};
  }
}

checkTTS(); // check to make sure the browser supports TTS

// make sure all models are loaded prior to starting video
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models/"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models/"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models/"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models/"),
]).then(startVideo());

// if we're playing, process the video feed
video.addEventListener("play", () => {
  processVideo();
});

//setTimeout(endExperiment, experiment_length); // end the experiment when it's time to

/* Computer Vision and Video Functions*/

function processVideo() {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: 1280, height: 720 };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // do nothing if we can't detect a face
    if (!detections.length) {
      console.log("lost a face");
      return;
    } else {
      //console.log(speaking);
    }

    /* Draw Face Detections in Debug Mode */
    if (draw === true) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }

    /* Process Expressions and Read Lines */
    var all_expressions = detections[0].expressions; // only respond to the first face we track

    //console.log(all_expressions);

    for (const [key, value] of Object.entries(all_expressions)) {
      //console.log(`${key}: ${value}`); // uncomment to see key value pairs for expressions
      if (value > expression_threshold) {
        current_expression = key;
        if (speaking !== true) {
          readLine(current_expression);
        }
        console.log(current_expression);
      }
    }
  }, expression_interval);
}

// getUserMedia() requires secure server setup https:// or local host
// if video feed not loading: in VS Code, right click on index.html and run w/ live server
function startVideo() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { audio: false, video: { width: 1280, height: 720 } },
      function (stream) {
        var video = document.querySelector("video");
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      },
      function (err) {
        console.log("The following error occurred: " + err.name);
      }
    );
  } else {
    alert(
      "This browser is not supported. Please use the newest version of Chrome or Firefox."
    );
    console.log("getUserMedia not supported");
  }
}

function determineExpression() {
  var all_expressions = detections[0].expressions;
  for (const [key, value] of Object.entries(all_expressions)) {
    //console.log(`${key}: ${value}`);
    if (value > expression_threshold) {
      console.log(`${key}: ${value}`);
    }
  }
}

/* Text To Speech Functions */

// Check to see if the browser supports TTS
function checkTTS() {
  if ("speechSynthesis" in window) {
    console.log("TTS supported");
  } else {
    alert(
      "Sorry, your browser doesn't support text to speech. Please exit the experiment."
    );
  }
}

function readLine(current_expression) {
  speaking = true;
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  //msg.volume = 1; // From 0 to 1
  //msg.pitch = 2; // From 0 to 2
  msg.rate = 0.9; // From 0.1 to 10
  bank = eval(current_expression + "_bank");
  let rand = Math.floor(Math.random() * bank.length);
  let selected_text = bank[rand];

  if (text_spoken.includes(selected_text)) {
    console.log("redundant"); // don't speak or include redundant text
    speaking = false;
  } else {
    msg.text = selected_text;
    speechSynthesis.speak(msg); // speak the message out loud
    text_spoken.push(msg.text); // record the message as spoken
    console.log(text_spoken);
    //console.log("made it here");
    // when the sentence is over add a pause, then go to standby
    msg.onend = function () {
      //console.log("ended line");
      setTimeout(goToStandby, Math.floor(Math.random() * 4500));
    };
  }
}

// prepare to say more things
function goToStandby() {
  speaking = false;
}
