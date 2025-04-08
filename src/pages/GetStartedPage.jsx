// src/pages/GetStartedPage.jsx
import { ContentBox } from '../components/common/ContentBox';
import { RecommendationDisplay } from '../components/RecommendationDisplay';
import { ActionButton } from '../components/common/ActionButton';

export const GetStartedPage = () => {
  return (
    <div>
      <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
        <h2 className="text-4xl font-bold mb-8 text-center">Build A Playlist</h2>
        
        {/* Instructions Box */}
        <ContentBox className="mb-8 border-black">
          <div className="prose max-w-none">
            <h3 className="text-2xl font-bold mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xl font-bold mb-2">1. Connect to Spotify</h4>
                <p className="text-gray-700">
                  Start by connecting to Spotify below. When it redirects, go back to the Build A Playlist Page and build away!
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">2. Upload your Analysis CSV</h4>
                <p className="text-gray-700">
                  Drop your CSV from Spectralify Audio into the upload field. If you do not have one, get one here: 
                  <div className="text-center">
                          <ActionButton 
                            onClick={() => window.open('https://drive.google.com/file/d/11yblXzIbKuY8gey5Jt-9sYflqWjZzgmi/view?usp=sharing', '_blank')}
                          >
                            Use Our Pre-made CSV!
                          </ActionButton>
                        </div>
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">2. Pick a Starting Point</h4>
                <p className="text-gray-700">
                  Select any song from your collection as a starting point. Our algorithm will
                  analyze its unique characteristics to find similar tracks.
                </p>
              </div>
            </div>
          </div>
        </ContentBox>

        {/* Recommendation Engine */}
        <RecommendationDisplay />
      </section>

      {/* Features Section */}
      <section className="bg-spectralify-yellow p-8 border-x-4 border-black">
        <h3 className="text-2xl font-bold mb-6 text-center">
          What We Analyze
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <ContentBox>
            <h4 className="font-bold mb-2">Rhythm Patterns</h4>
            <ul className="space-y-2 text-sm">
              <li>• Beat strength and regularity</li>
              <li>• Tempo and time signatures</li>
              <li>• Groove consistency</li>
              <li>• Rhythmic density</li>
            </ul>
          </ContentBox>
          <ContentBox>
            <h4 className="font-bold mb-2">Harmonic Content</h4>
            <ul className="space-y-2 text-sm">
              <li>• Key and tonality</li>
              <li>• Harmonic progression</li>
              <li>• Spectral contrast</li>
              <li>• Tonal energy distribution</li>
            </ul>
          </ContentBox>
          <ContentBox>
            <h4 className="font-bold mb-2">Sound Characteristics</h4>
            <ul className="space-y-2 text-sm">
              <li>• Dynamic range analysis</li>
              <li>• Energy distribution</li>
              <li>• Timbre profiles</li>
              <li>• Acoustic properties</li>
            </ul>
          </ContentBox>
        </div>
      </section>
    </div>
  );
};