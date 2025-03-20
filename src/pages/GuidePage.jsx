// src/pages/GuidePage.jsx
import React, { useState } from 'react';
import { ContentBox } from '../components/common/ContentBox';
import { ActionButton } from '../components/common/ActionButton';

export const GuidePage = ({ setActivePage }) => {
  const [activeCategory, setActiveCategory] = useState('basic');
  
  const categories = [
    { id: 'basic', name: 'Basic Information' },
    { id: 'pitch', name: 'Pitch & Tonality' },
    { id: 'rhythm', name: 'Rhythm Features' },
    { id: 'spectral', name: 'Spectral Features' },
    { id: 'tonal', name: 'Tonal Features' },
    { id: 'dynamics', name: 'Energy & Dynamics' },
    { id: 'timbre', name: 'Timbre Features' }
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
      }
    ],
    rhythm: [
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
        id: 25, 
        name: 'Average_Spectral_Rolloff', 
        definition: 'The frequency below which 85% of the spectral energy is contained, measured in Hertz (Hz).',
        example: 'A track with lots of high-frequency content like sizzling cymbals and bright synths would have high spectral rolloff.',
        dataExample: 'Radiohead\'s "Electioneering" has very high spectral rolloff (5703.1 Hz), indicating significant high-frequency content.',
        importance: 'Spectral rolloff helps match songs with similar high-frequency content, which strongly affects perceived brightness and clarity.'
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
        id: 29, 
        name: 'Spectral_Contrast_Mean', 
        definition: 'The average difference between peaks and valleys in the frequency spectrum, measured across different frequency bands.',
        example: 'A clean recording with distinct instruments would have high spectral contrast. A heavily compressed or distorted track where all sounds blend together would have lower contrast.',
        dataExample: 'Radiohead\'s "Meeting in the Aisle" has high spectral contrast (21.5), indicating clearly defined spectral elements.',
        importance: 'Spectral contrast helps match songs with similar clarity and definition between sonic elements.'
      }
    ],
    tonal: [
      { 
        id: 33, 
        name: 'Tonnetz Features', 
        definition: 'Six values representing a song\'s position in harmonic "tonal space." These capture complex relationships between notes and chords in a mathematical form.',
        example: 'These dimensions represent different aspects of harmony, such as major versus minor quality, tension versus resolution, and harmonic complexity.',
        dataExample: 'Radiohead\'s "Karma Police" has Tonnetz_1 value of 0.203, while "Paranoid Android" has 0.099, reflecting their different harmonic approaches.',
        importance: 'Tonnetz features are powerful for identifying songs with similar harmonic languages and chord progressions, even when they\'re in different keys.'
      },
      { 
        id: 39, 
        name: 'Poly Coefficients', 
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
        id: 48, 
        name: 'PCEN_Energy_Mean', 
        definition: 'Per-Channel Energy Normalized mean value, a measure of energy that better approximates human perception of loudness across different frequency bands.',
        example: 'PCEN processing makes quiet sounds more audible while preventing loud sounds from dominating, similar to how our ears adjust.',
        dataExample: 'Radiohead\'s "Paranoid Android" has PCEN energy mean of 16.6, while Billy Joel\'s "The Mexican Connection" has 15.8.',
        importance: 'PCEN energy provides a perceptually relevant match for how humans experience loudness in music.'
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
    ]
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
        
        <div className="text-center">
          <ActionButton onClick={() => setActivePage('get started')}>
                    Try it Out!
                  </ActionButton>
        </div>
      </section>
    </div>
  );
};