// src/pages/GuidePage.jsx
import React, { useState } from 'react';
import { ContentBox } from '../components/common/ContentBox';

export const GuidePage = ({ setActivePage }) => {
  const [activeCategory, setActiveCategory] = useState('basic');
  
  const categories = [
    { id: 'basic', name: 'Basic Information (1-4)' },
    { id: 'pitch', name: 'Pitch & Tonality (5-16)' },
    { id: 'rhythm', name: 'Rhythm Features (17-22)' },
    { id: 'spectral', name: 'Spectral Features (23-32)' },
    { id: 'tonal', name: 'Tonal Features (33-43)' },
    { id: 'dynamics', name: 'Energy & Dynamics (44-55)' },
    { id: 'instruments', name: 'Instrument Features (56-68)'},
    { id: 'timbre', name: 'Timbre Features (69-72)' },
    { id: 'vocal', name: 'Vocal Features (73-76)' },
    { id: 'signal', name: 'Signal Analysis Features (77-78)' },
    { id: 'mfcc', name: 'MFCC Features (79-130)' },
    { id: 'structure', name: 'Rhythm and Structure Features (131-138)' },
    { id: 'emotional', name: 'Perceptual and Emotional Features (139-142)' },
  ];
  
  const featureData = {
    basic: [
      { 
        id: 1, 
        name: 'Title', 
        definition: 'The name of the song as it appears in metadata.',
        example: 'When you look at a streaming service and see "Bohemian Rhapsody," that\'s the title.',
        dataExample: '"Airbag - Remastered" by Radiohead, indicating this is a remastered version of the song "Airbag."',
        importance: 'While not an acoustic feature itself, the title is essential for identifying tracks and presenting recommendations to users. It also allows the system to recognize different versions of the same composition.'
      },
      { 
        id: 2, 
        name: 'Artist', 
        definition: 'The performer or creator of the song.',
        example: '"The Beatles," "Beyoncé," or "Metallica" would be the artist.',
        dataExample: 'Our dataset includes "Radiohead" and "Billy Joel" as artists, representing different musical styles and eras.',
        importance: 'Artist information enables recommendations based on performer similarity, collaborative filtering, and analysis of sonic patterns within an artist\'s catalog.'
      },
      { 
        id: 3, 
        name: 'Album', 
        definition: 'The collection or release that the song belongs to.',
        example: '"Thriller" by Michael Jackson or "Dark Side of the Moon" by Pink Floyd are famous albums.',
        dataExample: '"OK Computer OKNOTOK 1997 2017" (a reissue of Radiohead\'s classic album with bonus tracks) and "Streetlife Serenade" (a Billy Joel album from 1974).',
        importance: 'Albums typically share production techniques, themes, and sonic characteristics. Songs from the same album often work well together in recommendations.'
      },
      { 
        id: 4, 
        name: 'Duration_Seconds', 
        definition: 'The total length of the track measured in seconds.',
        example: 'A typical pop song of 3 minutes and 30 seconds would have a duration of 210 seconds.',
        dataExample: 'Radiohead\'s "Paranoid Android" has a duration of 383.97 seconds (about 6:24), while Billy Joel\'s "Souvenir" is much shorter at 120.47 seconds (about 2:00).',
        importance: 'Duration is crucial for context-aware recommendations. For workout playlists, shorter tracks might be preferred. For focused work, longer pieces might be better.'
      }
    ],
    pitch: [
      { 
        id: 5, 
        name: 'Estimated_Key', 
        definition: 'The detected musical key of the song, including both the tonic note (C, D, E, etc.) and mode (major or minor).',
        example: 'If a song is in "C major," it predominantly uses the C major scale. If it\'s in "A minor," it uses the A minor scale, which often creates a more melancholic sound.',
        dataExample: 'Radiohead\'s "Karma Police" is in D major, while "Paranoid Android" is in A minor, contributing to their different emotional qualities.',
        importance: 'Songs in the same or related keys often blend well together in playlists. Key also strongly influences a song\'s emotional quality.'
      },
      { 
        id: 6, 
        name: 'Key_Confidence', 
        definition: 'A value from 0 to 1 indicating how confident the algorithm is about the detected key. Higher values mean greater certainty.',
        example: 'A solo piano piece playing clear chords might have a key confidence of 0.95 (very certain), while a complex jazz fusion piece with unusual harmonies might score 0.60 (moderately certain).',
        dataExample: 'Radiohead\'s "No Surprises" has a high key confidence of 0.94, as it has clear, consistent harmony.',
        importance: 'This feature helps the recommendation system know when to trust the key detection.'
      },
      { 
        id: 7, 
        name: 'Average_Pitch', 
        definition: 'The mean frequency across the entire track, measured in Hertz (Hz).',
        example: 'A song featuring a female vocalist with high notes and bright instrumentation would have a higher average pitch than a song with a bass-heavy male vocalist and low brass instruments.',
        dataExample: 'Billy Joel\'s "Root Beer Rag" has a high average pitch of 1348.7 Hz, reflecting its bright piano work in the upper registers.',
        importance: 'Average pitch helps match songs with similar tonal character. High-pitched songs often sound brighter and more energetic.'
      },
      { 
        id: 8, 
        name: 'Pitch_Std', 
        definition: 'The standard deviation of pitch, indicating how much the pitch varies throughout the song. Measured in Hertz (Hz).',
        example: 'A monotone spoken word piece would have very low pitch standard deviation. A song with dramatic vocal runs and varied instrumentation would have high pitch standard deviation.',
        dataExample: 'Radiohead\'s "Paranoid Android" has a high pitch standard deviation of 1025.3 Hz, reflecting its dramatic shifts between quiet verses and intense choruses. Billy Joel\'s "Souvenir" has a lower value of 646.2 Hz, indicating more consistent pitch content.',
        importance: 'This feature helps match songs with similar levels of pitch variation. It distinguishes between consistent, steady songs and more dynamic ones with dramatic shifts. Listeners often prefer consistent levels of pitch variation within a playlist.'
      },
      { 
        id: 9, 
        name: 'Pitch_Range', 
        definition: 'The range between the highest and lowest detected pitches in the track, measured in Hertz (Hz).',
        example: 'A classical symphony using the full range of instruments from bass to piccolo would have an extremely wide pitch range. A blues song featuring just bass, guitar, and a mid-range vocalist would have a narrower pitch range.',
        dataExample: 'Billy Joel\'s "Root Beer Rag" has a high average pitch of 1348.7 Hz, reflecting its bright piano work in the upper registers.',
        importance: 'Most songs in the dataset show values around 3850 Hz, which represents a fairly wide range. This consistency suggests that most commercial recordings utilize a similar breadth of the frequency spectrum, from low bass to high treble elements.'
      },
      { 
        id: 10, 
        name: 'pYIN_Mean_Pitch', 
        definition: 'The mean pitch as detected by the pYIN algorithm, which is specialized for monophonic pitch tracking.',
        example: 'A song by a bass vocalist like Barry White would have a low pYIN mean pitch, while a soprano like Mariah Carey would have a much higher value.',
        dataExample: 'Radiohead\'s "Climbing Up the Walls" has a relatively high pYIN mean pitch of 166.5 Hz, showing Thom Yorke\'s tendency to sing in a higher register in this track.',
        importance: 'This feature is excellent for matching songs with similar vocal ranges, helping find vocalists with comparable styles.'
      },
      { 
        id: 11, 
        name: 'pYIN_Pitch_Std', 
        definition: 'The standard deviation of the pYIN pitch detection, indicating how much the primary melodic line (often vocals) varies in pitch. Measured in Hertz (Hz).',
        example: 'A vocalist who sings in a monotone style would have a low value. A vocalist with dramatic runs, vibrato, and range would have a high value.',
        dataExample: 'Radiohead\'s "Lucky" has an extremely high pYIN pitch standard deviation of 516.3 Hz, indicating Thom Yorke\'s highly expressive, variable vocal performance. Billy Joel\'s "In Limbo" has a much lower value of 50.9 Hz, showing more pitch consistency in his vocal delivery.',
        importance: 'This feature helps match songs with similar vocal expressiveness. It distinguishes between steady, controlled vocal performances and more dynamic, variable ones. This can be crucial for matching singing styles that a listener might prefer.'
      },
      { 
        id: 12, 
        name: 'pYIN_Pitch_Range', 
        definition: 'The range between the highest and lowest pitches detected by the pYIN algorithm, typically representing the range of the main melodic instrument or vocalist.',
        example: 'A singer who uses both low chest voice and high falsetto would have a wide pYIN pitch range. A vocalist who stays within a comfortable mid-range would have a narrower range.',
        dataExample: 'Radiohead\'s "Climbing Up the Walls" has an extensive pYIN pitch range of 1876.2 Hz, showcasing Thom Yorke\'s wide vocal range in this track. In contrast, Radiohead\'s "Meeting in the Aisle" has a much smaller range of 118.5 Hz, as it\'s an instrumental track without the vocal variations.',
        importance: 'This helps identify songs with similar vocal ambition and range. Listeners who enjoy virtuosic vocal performances with wide ranges might prefer songs with higher values, while those who prefer more consistent, steady vocals might prefer lower values.'
      },
      { 
        id: 13, 
        name: 'pYIN_Voiced_Rate', 
        definition: 'The proportion of the track where a clear, tonal pitch can be detected, as opposed to unpitched sounds (like percussion) or silence. Ranges from 0 to 1.',
        example: 'A solo a cappella vocal performance would have a very high voiced rate (close to 1.0). A predominantly percussive piece with occasional melodic elements would have a low voiced rate.',
        dataExample: 'Radiohead\'s "No Surprises" has a high pYIN voiced rate of 0.82, reflecting its clear, prominent vocals and tonal instruments. "Electioneering" has a much lower rate of 0.33, indicating more non-pitched elements and distortion.',
        importance: 'This feature helps distinguish vocal-focused tracks from more instrumental or percussion-heavy ones. It\'s useful for matching songs with similar balances of pitched vs. unpitched content, which strongly affects the listening experience.'
      },
      { 
        id: 14, 
        name: 'pYIN_Mean_Confidence', 
        definition: 'The average confidence level of the pYIN pitch detection algorithm. Higher values (closer to 1) indicate that the algorithm is more certain about the pitches it\'s detecting.',
        example: 'A clean, isolated vocal recording would have high confidence. A voice buried in a wall of distorted guitars would have lower confidence.',
        dataExample: 'Billy Joel\'s "Root Beer Rag" has a relatively low pYIN mean confidence of 0.09, as it\'s an instrumental piano piece without clear vocal lines. Radiohead\'s "No Surprises" has a higher value of 0.24, reflecting its clearer vocal presence.',
        importance: 'This feature indicates how reliable the vocal/melodic pitch features are. It helps the recommendation system know when to trust the pitch-based features or rely more on other characteristics instead.'
      },
      { 
        id: 15, 
        name: 'pYIN_Pitch_Stability', 
        definition: 'A measure of how steady the detected pitches remain over time. Higher values indicate more stable, held notes; lower values indicate rapid pitch changes.',
        example: 'An opera singer holding long, sustained notes would have high pitch stability. A rapper with rapid, speech-like delivery or a vocalist using techniques like vocal runs would have low stability.',
        dataExample: 'Radiohead\'s "Karma Police" has a moderate pYIN pitch stability of 0.08, reflecting Thom Yorke\'s somewhat variable vocal style. "Melatonin" has an even lower stability of 0.06, showing more pitch variation.',
        importance: 'This feature helps match songs with similar vocal styles in terms of note duration and pitch movement. It distinguishes between songs with long, held notes and those with more agile, moving vocal lines.'
      },
      { 
        id: 16, 
        name: 'pYIN_Pitch_Clarity', 
        definition: 'How clearly defined the pitches are in the primary melodic line. Higher values indicate clean, precise pitches; lower values indicate more ambiguous pitch content.',
        example: 'A classical operatic performance would have high pitch clarity. A shouted or whispered vocal, or one with heavy distortion effects, would have lower clarity.',
        dataExample: 'Radiohead\'s "Airbag" has relatively high pitch clarity of 19.3, despite its complex instrumentation. Billy Joel\'s "Souvenir" has a much lower clarity of 3.9, possibly due to its softer, more intimate vocal performance.',
        importance: 'This feature helps match songs with similar vocal articulation and clarity. It distinguishes between precise, clean performances and more textural, ambiguous ones, which strongly influences the listening experience.'
      }
    ],
    rhythm: [
      { 
        id: 17, 
        name: 'Harmonic_Salience', 
        definition: 'A measure of how prominent the harmonic (tonal) content is relative to noise or inharmonic content in the track. Values closer to 1 indicate stronger harmonic presence.',
        example: 'A clean acoustic guitar recording would have high harmonic salience. A heavily distorted industrial track with lots of noise and percussion would have lower harmonic salience.',
        dataExample: ' Radiohead\'s "Let Down" has moderate harmonic salience of 0.16, balancing tonal elements with textural sounds. Billy Joel\'s "Souvenir" has a lower value of 0.05, possibly due to its more intimate, delicate sound with softer attacks.',
        importance: 'This feature helps distinguish between songs focused on clean tonal elements (like melody and harmony) versus those that emphasize texture, noise, and percussion. It\'s useful for matching songs with similar balances of these elements.'
      },
      { 
        id: 18, 
        name: 'Tempo_BPM', 
        definition: 'The speed of the music measured in Beats Per Minute, representing how many beats occur in 60 seconds.',
        example: 'A slow ballad might have a tempo of 60-70 BPM. A typical dance track might be around 120-130 BPM. An energetic punk song could reach 180 BPM or higher.',
        dataExample: 'Radiohead\'s "Paranoid Android" has a moderate tempo of 82 BPM, giving it a deliberate, measured pace.',
        importance: 'Tempo is one of the most perceptually obvious features of music and crucial for activity-based recommendations.'
      },
      { 
        id: 19, 
        name: 'Beat_Regularity', 
        definition: 'A measure of how consistent the time intervals are between beats. Higher values indicate steadier, more metronomic timing.',
        example: 'Electronic dance music typically has very high beat regularity, as it\'s often programmed to precise timing.',
        dataExample: 'Radiohead\'s "I Promise" has relatively high beat regularity (79.6), indicating a steady rhythmic foundation.',
        importance: 'Beat regularity strongly affects how we physically respond to music. Music for dancing or workouts typically needs higher regularity.'
      },
      { 
        id: 20, 
        name: 'Beat_Density', 
        definition: 'The number of beats per unit of time, representing how many rhythmic events occur in relation to the song\'s duration.',
        example: 'A sparse ballad with just a kick drum on beats 1 and 3 would have low beat density. A busy breakbeat track with 16th notes and syncopation would have high beat density.',
        dataExample: 'Billy Joel\'s "The Entertainer" has high beat density (2.57), reflecting its busy, ragtime-influenced piano style.',
        importance: 'Beat density affects perceived energy and complexity. This feature helps match songs that feel similarly "busy" or "sparse" rhythmically.'
      },
      { 
        id: 21, 
        name: 'Beat_Strength', 
        definition: 'The average intensity or prominence of the detected beats, indicating how strongly the rhythm is emphasized.',
        example: 'A hard rock track with heavy drum hits would have high beat strength. An ambient track with subtle, implied rhythm would have low beat strength.',
        dataExample: 'Radiohead\'s "Electioneering" has high beat strength (0.99), matching its more aggressive rock style.',
        importance: 'Beat strength strongly influences how "driving" or "laid-back" music feels.'
      },
      { 
        id: 22, 
        name: 'Groove_Consistency', 
        definition: 'How consistently the groove pattern (the specific rhythmic feel) is maintained throughout the song.',
        example: 'A dance track that maintains the same beat pattern throughout would have high groove consistency. A progressive rock song that moves through different time signatures and rhythmic feels would have lower groove consistency.',
        dataExample: 'Radiohead\'s "Electioneering" shows high groove consistency (27.6), maintaining its driving feel throughout. Radiohead\'s "In Limbo" has slightly lower consistency (23.7), reflecting its more complex rhythmic approach.',
        importance: 'This feature helps identify songs that maintain a similar rhythmic character throughout. It\'s useful for activities requiring consistent rhythmic engagement, like dancing or running.'
      }
    ],
    spectral: [
      { 
        id: 23, 
        name: 'Average_Spectral_Centroid', 
        definition: 'The center of gravity of the song\'s frequency spectrum, measured in Hertz (Hz). It represents the average "brightness" of the sound.',
        example: 'A track featuring lots of cymbals, high-pitched synthesizers, and female vocals would have a high spectral centroid.',
        dataExample: 'Radiohead\'s "Electioneering" has a high spectral centroid (2881.4 Hz), matching its brighter, more aggressive sound with prominent guitars.',
        importance: 'The spectral centroid is one of the strongest predictors of perceived timbral similarity.'
      },
      { 
        id: 24, 
        name: 'Spectral_Centroid_Std', 
        definition: 'The standard deviation of the spectral centroid over time, indicating how much the brightness of the sound varies throughout the song.',
        example: 'A song that maintains the same instrumentation throughout would have low spectral centroid variation. A song that alternates between sparse verses with bass and drums, and choruses with bright guitars and cymbals would have high variation.',
        dataExample: 'Radiohead\'s "Electioneering" and Billy Joel\'s "Souvenir" have similar values (959.0 and 987.9 respectively), suggesting both tracks maintain fairly consistent brightness despite their different overall tonal characters.',
        importance: 'This feature helps identify songs with similar levels of timbral variety. It distinguishes between songs that maintain consistent sonic textures and those that feature more dramatic shifts between dark and bright sections.'
      },
      { 
        id: 25, 
        name: 'Average_Spectral_Rolloff', 
        definition: 'The frequency below which 85% of the spectral energy is contained, measured in Hertz (Hz).',
        example: 'A track with lots of high-frequency content like sizzling cymbals and bright synths would have high spectral rolloff.',
        dataExample: 'Radiohead\'s "Electioneering" has very high spectral rolloff (5703.1 Hz), indicating significant high-frequency content.',
        importance: 'Spectral rolloff helps match songs with similar high-frequency content, which strongly affects perceived brightness and clarity.'
      },
      { 
        id: 26, 
        name: 'Spectral_Rolloff_Std', 
        definition: 'Standard deviation of the spectral rolloff, indicating how much the high-frequency content varies throughout the song.',
        example: 'A song with consistent instrumentation would have low spectral rolloff variation. A song that alternates between sections with and without cymbals or high-pitched elements would have high variation.',
        dataExample: 'Radiohead\'s "I Promise" has high spectral rolloff standard deviation (3201.3 Hz), showing substantial variation in high-frequency content. Billy Joel\'s "Souvenir" has lower variation (2168.2 Hz), indicating more consistent high-frequency treatment.',
        importance: 'This feature helps identify songs with similar patterns of high-frequency variation. It distinguishes between songs that maintain consistent brightness and those that feature more dramatic contrasts between sections.'
      },
      { 
        id: 27, 
        name: 'Average_Spectral_Bandwidth', 
        definition: 'The weighted average of the distance from each frequency bin to the spectral centroid, measured in Hertz (Hz).',
        example: 'A track with many instruments covering different frequency ranges would have high spectral bandwidth.',
        dataExample: 'Radiohead\'s "I Promise" has high spectral bandwidth (3917.5 Hz), indicating rich, diverse frequency content.',
        importance: 'Spectral bandwidth helps match songs with similar levels of frequency complexity and richness.'
      },
      { 
        id: 28, 
        name: 'Spectral_Bandwidth_Std', 
        definition: 'Standard deviation of the spectral bandwidth, showing how much the frequency spread varies over time.',
        example: 'A song that maintains the same instrumental palette throughout would have low bandwidth variation. A song that alternates between sparse sections and full ensemble parts would have high variation.',
        dataExample: 'Radiohead\'s "I Promise" has moderate bandwidth standard deviation (966.2 Hz). Billy Joel\'s "Souvenir" has slightly lower variation (765.8 Hz), suggesting more consistent spectral content.',
        importance: 'This feature helps identify songs with similar patterns of timbral evolution. It distinguishes between songs that maintain consistent frequency spread and those that feature more variation between full and sparse sections.'
      },
      { 
        id: 29, 
        name: 'Spectral_Contrast_Mean', 
        definition: 'The average difference between peaks and valleys in the frequency spectrum, measured across different frequency bands.',
        example: 'A clean recording with distinct instruments would have high spectral contrast. A heavily compressed or distorted track where all sounds blend together would have lower contrast.',
        dataExample: 'Radiohead\'s "Meeting in the Aisle" has high spectral contrast (21.5), indicating clearly defined spectral elements.',
        importance: 'Spectral contrast helps match songs with similar clarity and definition between sonic elements.'
      },
      { 
        id: 30, 
        name: 'Spectral_Contrast_Std', 
        definition: 'Standard deviation of spectral contrast, indicating how much the definition between spectral peaks and valleys changes throughout the song.',
        example: 'A song that maintains a consistent mix would have low contrast variation. A song that shifts between clearly defined sections and more blended, atmospheric passages would have higher variation.',
        dataExample: 'Radiohead\'s "Electioneering" has high contrast standard deviation (15.7), showing varied spectral definition. Billy Joel\'s "Souvenir" has slightly lower variation (13.8), indicating more consistent spectral definition throughout.',
        importance: 'This feature helps identify songs with similar patterns of spectral clarity variation. It\'s useful for matching songs that evolve similarly in terms of mix clarity and definition.'
      },
      { 
        id: 31, 
        name: 'Spectral_Entropy', 
        definition: 'A measure of the disorder or randomness in the frequency spectrum, ranging from 0 to 1. Higher values indicate more even distribution of energy across frequencies; lower values show more concentrated energy.',
        example: 'White noise would have very high spectral entropy (close to 1) as energy is evenly distributed. A pure sine tone would have very low entropy as energy is concentrated at one frequency.',
        dataExample: 'Most tracks in the dataset show values near 1.0, with Radiohead generally scoring higher than Billy Joel, reflecting Radiohead\'s more complex, varied sonic textures.',
        importance: 'Spectral entropy helps distinguish between ordered, traditional sounds and more experimental, complex ones. It\'s valuable for matching songs with similar levels of sonic complexity and unpredictability.'
      },
      { 
        id: 32, 
        name: 'Spectral_Flatness', 
        definition: 'The ratio of the geometric mean to the arithmetic mean of the spectrum, indicating how noise-like versus tonal a sound is. Values range from 0 (perfectly tonal) to 1 (perfectly noise-like).',
        example: 'A flute playing a pure tone would have very low spectral flatness. A cymbal crash or white noise would have high flatness.',
        dataExample: 'Radiohead\'s "Airbag" has a spectral flatness of 0.0014, indicating predominantly tonal content despite its rock instrumentation. Billy Joel\'s "The Mexican Connection" has a similar value of 0.0011, showing both tracks are primarily tonal rather than noise-based.',
        importance: 'Spectral flatness helps distinguish between music focused on tonal elements (notes, harmony) versus noise-based elements. It\'s useful for matching songs with similar balances of melodic versus textural approaches.'
      }
    ],
    tonal: [
      { 
        id: 33, 
        name: '(33-38) Tonnetz Features (Tonnetz_1 - Tonnetz_6)', 
        definition: 'Six values representing a song\'s position in harmonic "tonal space." These capture complex relationships between notes and chords in a mathematical form.',
        example: 'These dimensions represent different aspects of harmony, such as major versus minor quality, tension versus resolution, and harmonic complexity.',
        dataExample: 'Radiohead\'s "Karma Police" has Tonnetz_1 value of 0.203, while "Paranoid Android" has 0.099, reflecting their different harmonic approaches.',
        importance: 'Tonnetz features are powerful for identifying songs with similar harmonic languages and chord progressions, even when they\'re in different keys.'
      },
      { 
        id: 39, 
        name: '(39-43) Poly Coefficients (Poly_Coefficient_1 - Poly_Coefficient_5)', 
        definition: 'Coefficients of a polynomial fit to the frequency spectrum shape, capturing the overall spectral contour of the sound.',
        example: 'These coefficients mathematically describe the "shape" of a song\'s frequency spectrum - whether bass frequencies dominate, whether there\'s a mid-range focus, etc.',
        dataExample: 'Values vary widely across songs. Radiohead\'s "Paranoid Android" has a Poly_Coefficient_1 value of 2.1e-10.',
        importance: 'These features help match songs with similar spectral shapes, which strongly influences how we perceive sonic similarity.'
      }
    ],
    dynamics: [
      { 
        id: 44, 
        name: 'RMS_Energy_Mean', 
        definition: 'The average Root Mean Square energy, representing the overall loudness or power of the audio signal.',
        example: 'A loud rock track would have high RMS energy. A quiet acoustic ballad would have low RMS energy.',
        dataExample: 'Radiohead\'s "Electioneering" has relatively high RMS energy (15.1), fitting its more aggressive sound.',
        importance: 'RMS energy helps match songs with similar overall loudness levels, which strongly affects listening experience.'
      },
      { 
        id: 45, 
        name: 'RMS_Energy_Std', 
        definition: 'Standard deviation of RMS energy, indicating how much the loudness varies throughout the song.',
        example: 'A song with dramatic dynamics (quiet verses, loud choruses) would have high RMS energy variation.',
        dataExample: 'Radiohead\'s "Paranoid Android" has high RMS energy standard deviation (52.1), reflecting its dramatic dynamic shifts.',
        importance: 'This feature helps identify songs with similar dynamic patterns.'
      },
      { 
        id: 46, 
        name: 'Dynamic_Range', 
        definition: 'The difference between the loudest and quietest parts of the song, capturing the full range of volume variations.',
        example: 'Classical music often has very wide dynamic range, from whisper-quiet passages to full orchestral fortissimo.',
        dataExample: 'Radiohead\'s "Paranoid Android" has relatively high dynamic range (23.5), consistent with its varied sections.',
        importance: 'Dynamic range helps match songs with similar approaches to volume variation.'
      },
      { 
        id: 47, 
        name: 'Crest_Factor', 
        definition: 'The ratio of the peak amplitude to the RMS level of the audio signal. It indicates how much the loudest peaks stand out from the average level.',
        example: 'A heavily compressed rock track would have a low crest factor, as the peaks are reduced to be closer to the average level. A classical recording with natural dynamics would have a higher crest factor, with peaks standing well above the average.',
        dataExample: 'Radiohead\'s "Meeting in the Aisle" has a high crest factor (8.8), indicating preserved dynamic peaks. Billy Joel\'s "Souvenir" has a lower crest factor (7.1), suggesting somewhat more compressed dynamics.',
        importance: 'Crest factor helps match songs with similar production approaches to dynamics. Songs with similar crest factors will feel congruent in terms of dynamic treatment, which affects perceived production quality and era.'
      },
      { 
        id: 48, 
        name: 'PCEN_Energy_Mean', 
        definition: 'Per-Channel Energy Normalized mean value, a measure of energy that better approximates human perception of loudness across different frequency bands.',
        example: 'PCEN processing makes quiet sounds more audible while preventing loud sounds from dominating, similar to how our ears adjust.',
        dataExample: 'Radiohead\'s "Paranoid Android" has PCEN energy mean of 16.6, while Billy Joel\'s "The Mexican Connection" has 15.8.',
        importance: 'PCEN energy provides a perceptually relevant match for how humans experience loudness in music.'
      },
      { 
        id: 49, 
        name: 'PCEN_Energy_Std', 
        definition: 'Standard deviation of PCEN energy, showing how much the perceptual energy varies throughout the song.',
        example: 'A song with consistent perceived loudness would have low PCEN variation. A song with sections that feel dramatically different in loudness would have high variation.',
        dataExample: 'Radiohead\'s "Climbing Up the Walls" has high PCEN energy standard deviation (15.9), indicating dramatic perceived dynamics. Billy Joel\'s "Root Beer Rag" has significantly higher variation (19.1), showing even more dramatic perceived dynamic shifts.',
        importance: 'This feature helps match songs with similar patterns of perceived loudness variation, which contributes to emotional impact and engagement.'
      },
      { 
        id: 50, 
        name: 'Harmonic_Energy', 
        definition: 'The energy contained in the harmonic (tonal) components of the audio, separated from percussive elements.',
        example: 'A string quartet would have very high harmonic energy and little percussive energy. A drum solo would have minimal harmonic energy.',
        dataExample: 'Radiohead\'s "Karma Police" has moderate harmonic energy (0.45), balancing tonal elements with percussion. Billy Joel\'s "The Entertainer" has lower harmonic energy (0.39), despite being piano-based, possibly due to the percussive nature of his piano playing style.',
        importance: 'Harmonic energy helps match songs with similar balances of tonal versus percussive elements. It distinguishes between more melodic/harmonic approaches and more rhythm-focused approaches.'
      },
      { 
        id: 51, 
        name: 'Percussive_Energy', 
        definition: 'The energy contained in the percussive (non-tonal) components of the audio, separated from harmonic elements.',
        example: 'A drum-heavy track would have high percussive energy. A cappella singing would have very little percussive energy.',
        dataExample: 'Radiohead\'s "Paranoid Android" has relatively high percussive energy (0.29), indicating significant rhythmic elements. Billy Joel\'s "The Mexican Connection" has similar percussive energy (0.29), suggesting comparable rhythmic importance despite stylistic differences.',
        importance: 'Percussive energy helps match songs with similar rhythmic emphasis. It\'s particularly valuable for activity-focused playlists where rhythmic consistency is important.'
      },
      { 
        id: 52, 
        name: 'Harmonic_Ratio', 
        definition: 'The ratio of harmonic to percussive energy, indicating the balance between tonal and rhythmic elements.',
        example: 'A piano sonata would have a high harmonic ratio. A percussion ensemble piece would have a very low harmonic ratio.',
        dataExample: 'Radiohead\'s "Karma Police" has a harmonic ratio of 0.27, showing a balance between harmonic and percussive elements. Billy Joel\'s "Souvenir" has a lower ratio of 0.03, suggesting a more balanced approach between harmonics and percussion.',
        importance: 'Harmonic ratio helps match songs with similar balances between melodic/harmonic content and rhythmic/percussive content. This balance strongly influences a song\'s character and focus.'
      },
      { 
        id: 53, 
        name: 'Tonal_Energy_Ratio', 
        definition: 'The proportion of total energy contained in tonal (pitched) components versus all sound content.',
        example: 'A vocal jazz ballad would have high tonal energy ratio. A track featuring primarily unpitched percussion would have low tonal energy ratio.',
        dataExample: 'Radiohead\'s "Exit Music" has a moderate tonal energy ratio (0.03), balancing tonal and non-tonal elements. Billy Joel\'s "The Mexican Connection" has a higher ratio (0.04), indicating slightly more emphasis on tonal content.',
        importance: 'Tonal energy ratio helps distinguish between music focused on pitched elements (melody, harmony) versus unpitched elements (percussion, noise). It\'s useful for matching songs with similar balances of these components.'
      },
      { 
        id: 54, 
        name: 'VQT_Mean', 
        definition: 'Mean of the Variable-Q Transform, an analysis that provides better time-frequency resolution than standard transforms, especially for musical content.',
        example: 'VQT provides enhanced analysis of musical frequencies, with particular sensitivity to how real instruments and voices behave acoustically.',
        dataExample: 'Radiohead\'s "Karma Police" has VQT mean of 0.17, while Billy Joel\'s "Root Beer Rag" has 0.33, suggesting differences in their frequency content as captured by this specialized transform.',
        importance: 'VQT features provide a perceptually relevant analysis of frequency content, helping match songs that sound similar to human ears in ways traditional frequency analysis might miss.'
      },
      { 
        id: 55, 
        name: 'VQT_Std', 
        definition: 'Standard deviation of the Variable-Q Transform, indicating how much the specialized frequency content varies over time.',
        example: 'A song with consistent instrumentation would have low VQT variation. A song that moves through different instrumental textures would have higher variation.',
        dataExample: 'Radiohead\'s "Lucky" has VQT standard deviation of 0.21, while Billy Joel\'s "Weekend Song" has 0.37, indicating more variation in its specialized frequency content.',
        importance: 'This feature helps identify songs with similar patterns of spectral evolution, matching songs that develop similarly in terms of timbre and texture.'
      }
    ],
    instruments: [
      { 
        id: 56, 
        name: 'Bass_Presence', 
        definition: 'Detected presence of bass frequencies (typically 20-250 Hz), measured as a ratio of energy in this range to total spectral energy.',
        example: 'A bass-heavy hip-hop track would have high bass presence. A flute solo would have very low bass presence.',
        dataExample: 'Radiohead\'s "Airbag" has bass presence of 0.05, while Billy Joel\'s "The Entertainer" has 0.06, showing somewhat comparable bass emphasis despite different genres.',
        importance: 'Bass presence helps match songs with similar low-frequency emphasis, which strongly affects perceived fullness and weight. This is particularly important for systems with subwoofers or headphones with varied bass response.'
      },
      { 
        id: 57, 
        name: 'Kick_Drum_Presence', 
        definition: 'Detected presence of kick drum frequencies (typically 40-100 Hz), measured as a ratio of energy in this range to total spectral energy.',
        example: 'Electronic dance music typically has high kick drum presence. Acoustic folk might have much lower kick drum presence.',
        dataExample: 'Radiohead\'s "Let Down" has kick drum presence of 0.03, while Billy Joel\'s "The Entertainer" has 0.05, showing the slightly more pronounced kick drum in Joel\'s track.',
        importance: 'Kick drum presence helps match songs with similar rhythmic foundations. The kick drum often defines the basic pulse of music, so similar kick drum presence creates cohesive rhythmic experiences.'
      },
      { 
        id: 58, 
        name: 'Snare_Presence', 
        definition: 'Detected presence of snare drum frequencies (typically 120-600 Hz), measured as the ratio of energy in this range to total spectral energy.',
        example: 'Rock songs typically have high snare presence, with the snare on beats 2 and 4. Solo piano pieces would have minimal snare presence.',
        dataExample: 'Radiohead\'s "Paranoid Android" has snare presence of 0.06, while Billy Joel\'s "The Entertainer" has 0.07, showing comparable prominence of snare frequencies despite their different styles.',
        importance: 'Snare presence helps match songs with similar rhythmic character. The snare often provides the "backbeat" that defines a song\'s feel, so similar snare presence creates rhythmically cohesive playlists.'
      },
      { 
        id: 59, 
        name: 'Cymbals_Presence', 
        definition: 'Detected presence of cymbal frequencies (typically 2000-16000 Hz), measured as the ratio of energy in this range to total spectral energy.',
        example: 'Jazz with "ride" cymbal patterns would have high cymbal presence. Bass-focused dub music might have minimal cymbal presence.',
        dataExample: 'Radiohead\'s "Karma Police" has cymbal presence of 0.04, while Billy Joel\'s "The Mexican Connection" has a similar value of 0.04, indicating comparable high-frequency percussion content.',
        importance: 'Cymbal presence affects the perceived brightness and energy of drums. This feature helps create playlists with consistent high-frequency percussion character.'
      },
      { 
        id: 60, 
        name: 'Electric_Guitar_Presence', 
        definition: 'Detected presence of electric guitar frequencies (typically 400-4000 Hz), measured as the ratio of energy in this range to total spectral energy.',
        example: 'Rock songs would typically have high electric guitar presence. Classical orchestral pieces would have minimal electric guitar presence.',
        dataExample: 'Radiohead\'s "Lucky" has electric guitar presence of 0.03, while Billy Joel\'s "Weekend Song" has 0.04, showing somewhat comparable mid-range instrumental content.',
        importance: 'Electric guitar presence helps identify songs with similar instrumental palettes. The electric guitar has a distinctive frequency profile that strongly influences a song\'s character.'
      },
      { 
        id: 61, 
        name: 'Vocals_Presence', 
        definition: 'Detected presence of vocal frequencies (typically 200-4000 Hz), measured as the ratio of energy in this range to total spectral energy.',
        example: 'A solo vocal performance would have very high vocals presence. An instrumental jazz piece would have minimal vocals presence.',
        dataExample: 'Radiohead\'s "Exit Music" has vocals presence of 0.03, while Billy Joel\'s "The Mexican Connection" has 0.04, suggesting the latter may have frequencies that resemble vocal ranges despite being instrumental.',
        importance: 'Vocals presence helps distinguish between vocal-focused and instrumental tracks. This is valuable for creating playlists that maintain consistent vocal presence, or for filtering based on vocal content.'
      },
      { 
        id: 62, 
        name: 'Synthesizer_Presence', 
        definition: 'Detected presence of synthesizer frequencies (typically 100-8000 Hz, with particular harmonic patterns), measured as the ratio of energy in this range to total spectral energy.',
        example: 'Electronic dance music would have high synthesizer presence. Acoustic folk would have minimal synthesizer presence.',
        dataExample: 'Radiohead\'s "Meeting in the Aisle" has synthesizer presence of 0.04, reflecting its electronic elements. Billy Joel\'s "Root Beer Rag" has 0.06, potentially because piano frequencies can overlap with synthesizer ranges.',
        importance: 'Synthesizer presence helps identify songs with similar electronic versus acoustic character. This is useful for creating genre-coherent playlists or matching production eras.'
      },
      { 
        id: 63, 
        name: 'Guitar_Distortion', 
        definition: 'Detected amount of distortion in guitar sounds, based on harmonic patterns typical of distorted guitar.',
        example: 'Heavy metal would have high guitar distortion. Acoustic fingerstyle guitar would have minimal distortion.',
        dataExample: 'Radiohead\'s "Electioneering" has guitar distortion of 0.14, reflecting its more aggressive guitar approach. Billy Joel\'s "The Mexican Connection" has 0.13, which may represent other distorted elements detected in the piano-based track.',
        importance: 'Guitar distortion helps match songs with similar levels of aggression and "heaviness" in guitar treatment. It\'s particularly valuable for rock subgenre matching.'
      },
      { 
        id: 64, 
        name: 'Drum_Prominence', 
        definition: 'The overall prominence of drum sounds relative to other elements, based on typical drum frequency and temporal patterns.',
        example: 'A drum-focused breakbeat track would have high drum prominence. A string quartet would have minimal drum prominence.',
        dataExample: 'Radiohead\'s "Paranoid Android" has drum prominence of 0.11, while Billy Joel\'s "Weekend Song" has 0.15, indicating slightly more prominent drums in Joel\'s track.',
        importance: 'Drum prominence helps match songs with similar emphasis on percussion. It distinguishes between rhythm-focused tracks and those where other elements take precedence.'
      },
      { 
        id: 65, 
        name: 'Vocal_Harmonicity', 
        definition: 'A measure of how harmonic (tonal) the vocal content is versus noise-like, based on the ratio of harmonic to non-harmonic content in vocal frequency ranges.',
        example: 'Clean, sustained singing would have high vocal harmonicity. Screamed or whispered vocals would have lower harmonicity.',
        dataExample: 'Radiohead\'s "No Surprises" has vocal harmonicity of 0.12, reflecting Thom Yorke\'s relatively clean vocals on this track. Billy Joel\'s "The Mexican Connection" has 0.13, though this is likely measuring other instruments in vocal frequency ranges since it\'s instrumental.',
        importance: 'Vocal harmonicity helps match songs with similar vocal techniques and qualities. It distinguishes between clean, traditional singing and more experimental vocal approaches.'
      },
      { 
        id: 66, 
        name: 'Rhythm_Regularity', 
        definition: 'A measure of how consistent the rhythmic patterns are throughout the song.',
        example: 'Electronic dance music typically has very high rhythm regularity. Free jazz would have very low rhythm regularity.',
        dataExample: 'Radiohead\'s "Paranoid Android" has rhythm regularity of 0.06, reflecting its varied sections with different rhythmic approaches. Billy Joel\'s "The Entertainer" has a much higher value of 0.15, indicating more consistent rhythmic patterns throughout.',
        importance: 'Rhythm regularity helps create playlists with consistent rhythmic character. It distinguishes between tracks with steady, predictable rhythms and those with more variable or experimental timing.'
      },
      { 
        id: 67, 
        name: 'Rhythm_Density', 
        definition: 'The amount of rhythmic activity or number of rhythmic events per unit time.',
        example: 'Busy drum fills and complex percussion would create high rhythm density. Simple quarter-note pulses would create low rhythm density.',
        dataExample: 'Radiohead\'s "Meeting in the Aisle" has rhythm density of 0.22, while Billy Joel\'s "Weekend Song" has 0.13, suggesting Radiohead\'s track has busier, more complex rhythmic patterns.',
        importance: 'Rhythm density helps match songs with similar levels of rhythmic complexity and activity. It helps create playlists with consistent rhythmic engagement level.'
      },
      { 
        id: 68, 
        name: 'Drum_Pattern_Strength', 
        definition: 'The prominence and consistency of repeating drum patterns.',
        example: 'A dance track with a clear, repeated beat pattern would have high drum pattern strength. A free-form percussion improvisation would have low pattern strength.',
        dataExample: 'Radiohead\'s "Paranoid Android" has drum pattern strength of 0.04, reflecting its varied drum approaches. Billy Joel\'s "Weekend Song" has 0.05, suggesting slightly more consistent drum patterns.',
        importance: 'Drum pattern strength helps identify songs with similar approaches to rhythm structure. It distinguishes between tracks with clearly defined, repeated drum patterns and those with more variable or through-composed rhythms.'
      }
    ],
    timbre: [
      { 
        id: 69, 
        name: 'Timbre_Brightness', 
        definition: 'A measure of the overall brightness of the timbre, derived from spectral characteristics and harmonic structure.',
        example: 'A track featuring flutes, violins, and cymbals would have high timbre brightness.',
        dataExample: 'Radiohead\'s "Paranoid Android" has timbre brightness of 0.21, while Billy Joel\'s "Root Beer Rag" has higher brightness of 0.54.',
        importance: 'Timbre brightness helps match songs with similar overall tonal character.'
      },
      { 
        id: 70, 
        name: 'Timbre_Complexity', 
        definition: 'A measure of how complex and varied the timbral elements are, derived from spectral and temporal variation patterns.',
        example: 'A track with many different instruments, effects, and textural changes would have high timbre complexity.',
        dataExample: 'Radiohead\'s "Paranoid Android" has timbre complexity of 0.30, reflecting its varied instrumentation and production techniques.',
        importance: 'Timbre complexity helps match songs with similar levels of timbral sophistication and variety.'
      },
      { 
        id: 71, 
        name: 'Instrument_Richness', 
        definition: 'A measure of the diversity and fullness of instrumental textures, based on frequency distribution and harmonic patterns.',
        example: 'A full orchestra would have high instrument richness. A solo guitar would have low instrument richness.',
        dataExample: 'Radiohead\'s "Lucky" has instrument richness of 0.04, while Billy Joel\'s "Root Beer Rag" has 0.06.',
        importance: 'Instrument richness helps match songs with similar levels of instrumental layering and complexity.'
      },
      { 
        id: 72, 
        name: 'Vocal_Pitch_Range', 
        definition: 'The range between the highest and lowest detected vocal pitches, measuring the breadth of the vocal performance.',
        example: 'An operatic aria with dramatic high and low notes would have high vocal pitch range.',
        dataExample: 'Radiohead\'s "Climbing Up the Walls" has quite high vocal pitch range (6.48), reflecting Thom Yorke\'s expressive vocal performance.',
        importance: 'Vocal pitch range helps match songs with similar vocal expressiveness and ambition.'
      }
    ],
    vocal: [
      { 
        id: 73, 
        name: 'Vocal_Pitch_Stability', 
        definition: 'A measure of how steady the vocal pitch remains, with higher values indicating more stable pitches.',
        example: 'An opera singer holding long, sustained notes would have high pitch stability. Rapid, speech-like vocals or decorative melismas would have lower stability.',
        dataExample: 'Radiohead\'s "No Surprises" has vocal pitch stability of 0.03, indicating fairly variable pitch. Billy Joel\'s "The Mexican Connection" has 0.04, likely measuring other instruments since it\'s instrumental.',
        importance: 'Vocal pitch stability helps match songs with similar vocal styles in terms of note duration and steadiness. It distinguishes between songs with sustained, legato vocal approaches and those with more agile, variable delivery.'
      },
      { 
        id: 74, 
        name: 'Vocal_Vibrato', 
        definition: 'The detected amount of regular pitch oscillation in vocals, typical of trained singing techniques.',
        example: 'Classical opera would typically have pronounced vocal vibrato. Indie-folk might have minimal vibrato for a more "authentic" sound.',
        dataExample: 'Radiohead\'s tracks typically show low vocal vibrato values, consistent with Thom Yorke\'s relatively straight singing style. Billy Joel\'s tracks show comparable values, suggesting moderate vibrato use.',
        importance: 'Vocal vibrato helps match songs with similar singing techniques and stylistic approaches. It can be a subtle but important factor in vocal similarity perception.'
      },
      { 
        id: 75, 
        name: 'Vocal_Formant_Variation', 
        definition: 'How much the vocal formants (resonant frequencies that define vowel sounds) vary throughout the track.',
        example: 'A song with many different vowel sounds and vocal techniques would have high formant variation. A repetitive chant on the same vowel would have low variation.',
        dataExample: 'Radiohead\'s "Exit Music" has vocal formant variation of 0.04, while Billy Joel\'s "Weekend Song" has 0.06, suggesting somewhat more varied vocal articulation in Joel\'s track.',
        importance: 'Vocal formant variation helps match songs with similar approaches to vocal articulation and variety. It distinguishes between more monotonous vocal deliveries and more varied ones.'
      },
      { 
        id: 76, 
        name: 'Vocal_Clarity', 
        definition: 'How clearly defined the vocal elements are against the instrumental backdrop.',
        example: 'A vocal-forward mix with minimal effects would have high vocal clarity. Heavily processed vocals buried in the mix would have low clarity.',
        dataExample: 'Radiohead\'s "Karma Police" has vocal clarity of 0.03, while Billy Joel\'s "Weekend Song" has 0.05, suggesting somewhat clearer vocals in Joel\'s production approach.',
        importance: 'Vocal clarity helps match songs with similar vocal production approaches. It distinguishes between clear, front-and-center vocals and more textural, blended vocal treatments.'
      }
    ],
    signal: [
      { 
        id: 77, 
        name: 'Reassigned_Frequency_Mean', 
        definition: 'The mean frequency from a reassigned spectrogram, which provides enhanced time-frequency precision for audio analysis.',
        example: 'Reassigned frequency analysis gives a more accurate picture of where the energy is concentrated in the frequency spectrum, with greater precision than standard methods.',
        dataExample: 'Radiohead\'s "Let Down" has reassigned frequency mean of 3.0, while Billy Joel\'s "Root Beer Rag" has 14.8, indicating significant differences in their frequency distributions as analyzed by this specialized method.',
        importance: 'Reassigned frequency features provide higher-resolution matching of frequency characteristics, helping identify subtle similarities in tonal content that standard analysis might miss.'
      },
      { 
        id: 78, 
        name: 'Reassigned_Magnitude_Mean', 
        definition: 'The mean magnitude or intensity from a reassigned spectrogram, representing the strength of the signal in this enhanced analysis.',
        example: 'This feature captures how intense the various frequency components are, with greater precision than standard methods.',
        dataExample: 'Radiohead\'s "Electioneering" has reassigned magnitude mean of 2.4, while Billy Joel\'s "Weekend Song" has 4.7, suggesting differences in their spectral intensity patterns.',
        importance: 'Reassigned magnitude helps match songs with similar spectral intensity characteristics, providing an additional dimension of timbral similarity beyond standard features.'
      }
    ],
    mfcc: [
      { 
        id: 79, 
        name: '(79-130) MFCC Features (MFCC_1_Mean through MFCC_13_Delta2_Std)', 
        definition: 'Mel-Frequency Cepstral Coefficients are a set of features that represent the short-term power spectrum of sound, based on a linear cosine transform of a log power spectrum on a nonlinear Mel scale of frequency. They capture the "shape" of the spectral envelope.',
        example: 'MFCCs are similar to a vocal tract model—they capture the "shape" of sound production. The first coefficient relates to overall loudness, the second to the balance of low vs high energy, and higher coefficients to increasingly fine details of the spectral shape.',
        dataExample: 'The dataset contains means and standard deviations for 13 MFCC coefficients, plus their first derivatives (deltas, showing how quickly they change) and second derivatives (delta-deltas, showing acceleration of change). For example, Radiohead\'s "Karma Police" has MFCC_1_Mean of -109.38, while Billy Joel\'s "The Entertainer" has -129.45.',
        importance: 'MFCCs are extremely powerful for timbre matching, as they capture the essential character of how sounds are produced. They\'re widely used in audio fingerprinting and song similarity systems to match songs that "sound alike" regardless of other musical characteristics.'
      }
    ],
    structure: [
      { 
        id: 131, 
        name: 'HPSS_Harmonic_Mean', 
        definition: 'The average energy in the harmonic (tonal) components after Harmonic-Percussive Source Separation.',
        example: 'A violin concerto would have high HPSS harmonic mean. A percussion ensemble would have low harmonic mean.',
        dataExample: 'Radiohead\'s "Karma Police" has HPSS harmonic mean of 0.49, while Billy Joel\'s "Root Beer Rag" has 0.72, indicating Joel\'s track has greater emphasis on harmonic elements despite its percussive piano style.',
        importance: 'HPSS harmonic mean helps identify music with similar balances of tonal versus rhythmic focus. It helps create playlists with consistent harmonic emphasis.'
      },
      { 
        id: 132, 
        name: 'HPSS_Percussive_Mean', 
        definition: 'The average energy in the percussive (non-tonal) components after Harmonic-Percussive Source Separation.',
        example: 'A drum solo would have high HPSS percussive mean. A string quartet would have low percussive mean.',
        dataExample: 'Radiohead\'s "Electioneering" has HPSS percussive mean of 0.29, reflecting its rhythmic emphasis. Billy Joel\'s "The Entertainer" has 0.30, showing comparable emphasis on percussive elements.',
        importance: 'HPSS percussive mean helps match songs with similar levels of rhythmic versus tonal focus. It\'s particularly useful for activity-based playlists where rhythmic consistency matters.'
      },
      { 
        id: 133, 
        name: 'HPSS_Ratio', 
        definition: 'The ratio of harmonic to percussive content, indicating the balance between tonal and rhythmic elements.',
        example: 'A piano sonata would have a high HPSS ratio. A drum and bass track would have a low HPSS ratio.',
        dataExample: 'Radiohead\'s "Lucky" has HPSS ratio of 4.0, indicating a strong balance of harmonic over percussive elements. Billy Joel\'s "The Mexican Connection" has 3.0, showing somewhat less harmonic dominance.',
        importance: 'HPSS ratio helps match songs with similar fundamental balances between melodic/harmonic focus and rhythmic/percussive focus, which strongly influences musical character.'
      },
      { 
        id: 134, 
        name: 'Segment_Count', 
        definition: 'The number of distinct segments or sections detected in the song based on changes in acoustic features.',
        example: 'A progressive rock song with many different parts would have high segment count. A simple verse-chorus-verse song might have lower segment count.',
        dataExample: 'Radiohead\'s "Paranoid Android" has a high segment count of 1674, reflecting its complex, multi-part structure. Billy Joel\'s "Root Beer Rag" has 1191, showing it also has substantial sectional variation.',
        importance: 'Segment count helps match songs with similar structural complexity. It distinguishes between straightforward songs with few sections and more complex compositions with multiple distinct parts.'
      },
      { 
        id: 135, 
        name: 'Average_Segment_Duration', 
        definition: 'The average length of detected segments in seconds, indicating how quickly the song moves between different sections.',
        example: 'A song with long, developing sections would have high average segment duration. A song that rapidly jumps between different ideas would have low average segment duration.',
        dataExample: 'Radiohead\'s "Paranoid Android" has average segment duration of 0.23 seconds, suggesting many micro-changes in its acoustic features. Billy Joel\'s "The Entertainer" has 0.19, indicating even more rapid acoustic variation.',
        importance: 'Average segment duration helps match songs with similar pacing of structural development. It distinguishes between songs that develop gradually and those that change more rapidly.'
      },
      { 
        id: 136, 
        name: 'Segment_Duration_Std', 
        definition: 'Standard deviation of segment durations, showing how consistently or variably the song moves between sections.',
        example: 'A song with very regular, predictable section lengths would have low segment duration variation. A song with an unpredictable structure of very short and very long sections would have high variation.',
        dataExample: 'Radiohead\'s "Electioneering" has segment duration standard deviation of 0.42, showing moderate variation in section lengths. Billy Joel\'s "Root Beer Rag" has lower variation at 0.07, suggesting more consistent section lengths.',
        importance: 'This feature helps identify songs with similar approaches to structural pacing. It distinguishes between songs with predictable structural rhythm and those with more variable section lengths.'
      },
      { 
        id: 137, 
        name: 'First_Segment_Time', 
        definition: 'The time (in seconds) at which the first significant structural change is detected.',
        example: 'A song with a long intro would have a high first segment time. A song that jumps straight into its main section would have a low first segment time.',
        dataExample: 'Many tracks in the dataset show very low first segment times (below 1 second), suggesting immediate establishment of their core acoustic features.',
        importance: 'First segment time helps match songs with similar approaches to introductions. It distinguishes between songs that establish their character immediately and those that build up more gradually.'
      },
      { 
        id: 138, 
        name: 'Last_Segment_Time', 
        definition: 'The time (in seconds) at which the last significant structural change is detected.',
        example: 'A song with a distinct outro section would have a last segment time well before the end of the track. A song that maintains its final section until the very end would have a last segment time close to the track duration.',
        dataExample: 'Radiohead\'s "Paranoid Android" has last segment time of 380.4 seconds, close to its total duration, suggesting structural development continues throughout. Billy Joel\'s "Root Beer Rag" shows similar pattern.',
        importance: 'Last segment time helps identify songs with similar approaches to endings. It distinguishes between songs that resolve early and those that continue developing until the very end.'
      }
    ],
    emotional: [
      { 
        id: 139, 
        name: 'Bass_Prominence', 
        definition: 'A measure of how prominent the bass frequencies are relative to the rest of the spectrum.',
        example: 'Hip-hop typically has high bass prominence. Folk might have lower bass prominence.',
        dataExample: 'Radiohead\'s "In Limbo" has bass prominence of 18.9, while Billy Joel\'s "Souvenir" has 10.4, indicating Radiohead\'s track has more emphasized low-frequency content.',
        importance: 'Bass prominence strongly affects the physical impact of music. This feature helps create playlists with consistent low-frequency character, which is particularly important for systems with varied bass reproduction capabilities.'
      },
      { 
        id: 140, 
        name: 'Vocal_Presence', 
        definition: 'A perceptually-weighted measure of how prominent vocals are in the mix.',
        example: 'A singer-songwriter track would have high vocal presence. An ambient instrumental would have minimal vocal presence.',
        dataExample: 'Radiohead\'s "Climbing Up the Walls" has vocal presence of 0.74, indicating prominent vocals. Billy Joel\'s "The Mexican Connection" has 0.63, suggesting frequencies that may register as vocal-like despite being instrumental.',
        importance: 'Vocal presence helps create playlists with consistent vocal emphasis. It distinguishes between vocal-forward tracks and those where instruments take the lead.'
      },
      { 
        id: 141, 
        name: 'Emotional_Valence', 
        definition: 'An estimate of the positive versus negative emotional quality of the music, based on acoustic features correlated with emotional response. Ranges from 0 (negative) to 1 (positive).',
        example: 'Bright major-key pop songs typically have high valence. Minor-key ballads about heartbreak would have low valence.',
        dataExample: 'Radiohead\'s "No Surprises" has relatively high emotional valence (0.57) despite its melancholic lyrics, reflecting its gentle musical character. Billy Joel\'s "Souvenir" has lower valence (0.37), suggesting a more somber musical quality.',
        importance: 'Emotional valence helps create mood-based playlists that maintain consistent emotional character. It\'s particularly valuable for activity-specific recommendations (workout, relaxation, focus) where emotional tone matters.'
      },
      { 
        id: 142, 
        name: 'Emotional_Arousal', 
        definition: 'An estimate of the energy or intensity level of the music\'s emotional impact, based on acoustic features. Ranges from 0 (calm) to 1 (energetic).',
        example: 'An aggressive heavy metal track would have high arousal. A gentle lullaby would have low arousal.',
        dataExample: 'Radiohead\'s "Electioneering" has high emotional arousal (0.63), matching its more aggressive approach. Billy Joel\'s "Souvenir" has lower arousal (0.48), reflecting its more restrained, intimate character.',
        importance: 'Emotional arousal helps match songs with similar energy levels. It\'s crucial for activity-based playlists where maintaining appropriate energy levels is important (workout, study, sleep).'
      }
    ],

  };

  return (
    <div>
      <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
        <h2 className="text-4xl font-bold mb-8 text-center">Guide to Spectralify</h2>
        
        <ContentBox className="mb-8 border-black">
          <h3 className="text-2xl font-bold mb-4 text-center">Introduction to Spectralify</h3>
          <p className="mb-6">
            Spectralify is an advanced audio processing toolkit that extracts comprehensive acoustic features 
            from music files. Built on Python libraries like Librosa and NumPy, it analyzes raw audio signals 
            to generate precise quantitative measurements of musical characteristics including pitch, rhythm, 
            timbre, harmony, and dynamics.
          </p>
          <p className="mb-6">
            The toolkit processes audio at the signal level, deconstructing the complex waveforms into 
            meaningful numeric values that represent how we perceive music. For example, rather than simply 
            knowing a song is labeled "rock," Spectralify can tell you exactly how distorted the guitars are, 
            how consistent the drummer's timing is, and whether the vocalist has a wide pitch range.
          </p>
          <p>
            This sophisticated analysis enables music recommendation systems to understand the actual acoustic 
            properties that make songs sound similar or different, going far beyond traditional metadata like 
            genre tags. Spectralify provides the foundation for truly content-based music discovery, where 
            recommendations are based on the intrinsic sonic qualities of the music itself.
          </p>
        </ContentBox>

        <ContentBox className="mb-8 border-black">
          <h3 className="text-2xl font-bold mb-4 text-center">Feature Catalog</h3>
          <h4 className="text-m font-bold mb-4 text-center">Comparing Billy Joel's "Souvenir" to Radiohead's "OK Computer OKNOTOK 1997 2017"</h4>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg border-2 border-black ${
                  activeCategory === category.id 
                  ? 'bg-spectralify-coral text-white' 
                  : 'bg-white text-black hover:bg-spectralify-yellow'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="space-y-6">
            {featureData[activeCategory].map(feature => (
              <div key={feature.id} className="border-b-2 border-gray-200 pb-6 last:border-b-0">
                <h4 className="text-xl font-bold mb-2">{feature.id}. {feature.name}</h4>
                <p className="mb-2"><strong>Definition:</strong> {feature.definition}</p>
                <p className="mb-2"><strong>Simple example:</strong> {feature.example}</p>
                <p className="mb-2"><strong>Data example:</strong> {feature.dataExample}</p>
                <p><strong>Recommendation importance:</strong> {feature.importance}</p>
              </div>
            ))}
          </div>
        </ContentBox>
      </section>
      
      <section className="bg-[#F9C846] p-8 border-x-4 border-black">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Why Spectralify Matters for Music Recommendation
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ContentBox>
            <h4 className="font-bold mb-2">Content-Based Understanding</h4>
            <p className="text-sm">
              Rather than relying solely on metadata tags or user behavior, Spectralify enables truly content-based 
              recommendations by analyzing what the music actually sounds like, capturing similarities that genre 
              labels often miss.
            </p>
          </ContentBox>
          
          <ContentBox>
            <h4 className="font-bold mb-2">Multidimensional Similarity</h4>
            <p className="text-sm">
              With 142 features, Spectralify captures music similarity across multiple dimensions—from rhythm and 
              harmony to timbre and dynamics—allowing for nuanced matching that aligns with how humans perceive 
              musical relationships.
            </p>
          </ContentBox>
          
          <ContentBox>
            <h4 className="font-bold mb-2">Context-Aware Recommendations</h4>
            <p className="text-sm">
              Features like tempo, energy levels, and emotional characteristics enable context-specific 
              recommendations for different activities (workouts, studying, relaxation) that truly match 
              the acoustic requirements of each scenario.
            </p>
          </ContentBox>
          
          <ContentBox>
            <h4 className="font-bold mb-2">Cross-Genre Discovery</h4>
            <p className="text-sm">
              By focusing on acoustic properties rather than genre labels, Spectralify can identify meaningful 
              similarities between songs from different genres, enhancing musical discovery and exposing listeners 
              to new sounds they might enjoy.
            </p>
          </ContentBox>
        </div>
      </section>
    </div>
  );
};