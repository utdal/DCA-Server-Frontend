import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CoevolvingPairs from './pages/CoevolvingPairs';
import LGL from './pages/LGL';
import SEEC from './pages/SEEC';
import SEECResults from './pages/SEECResults';
import Introvid from './pages/Introvid';
import Bioguide from './pages/Bioguide';
import CoevolvingPairsResults from './pages/CoevolvingPairsResults';
import CoevolvingPairsThumbnail from './pages/CoevolvingPairsThumbnailV2.png';
import elihksirLogo from './pages/elihksirLogo.png';
import eli from './pages/CoevolvingPairsThumbnailV2.png';
import prosspecLogo from './pages/ProSSpeC_logo.png';
import dcascapesLogo from './pages/dcascapesLogo.png';
import seecLogo from './pages/SEEC-SF-Long.png';
import molegulegoLogo from './pages/moleculego.png';
import githibLogo from './pages/github-mark.png';
import nsfLogo from './pages/nsfLogo.webp';
import LGLThumbnail from './pages/LGLThumbnail.png';
import DCATaskList from './pages/DCATaskList';
import LoadingPage from './pages/LoadingPage';
import Tile from './components/Tile';
import ResultsPage from './pages/ResultsPage';
import HomeButton from './components/HomeButton';
import ViewTasks from './pages/ViewTasks';
import UTDLogo from './pages/UTDLogo.png';
import RiceLogo from './pages/rice-logo.png';
import ApiTest from './backend/ApiTest';
import UnifiedTopBar from './components/UnifiedTopBar';
import ToggleBox from './components/ToggleBox';

import './App.css';

import { Link } from 'react-router-dom';
import { width } from '@fortawesome/free-brands-svg-icons/fa42Group';
import LabTeam from './pages/Labdirectory';
import PublicationsPage from './pages/Publications';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/coevolving-pairs" element={<CoevolvingPairs />} />
          <Route path="/coevolving-pairs-results" element={<CoevolvingPairsResults />} />
          <Route path='/LGL' element={<LGL />} />
          <Route path='/seec' element={<SEEC />} />
          <Route path='/seec-results' element={<SEECResults/>}/>
          <Route path="/introductory-video" element={<Introvid />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/guide-for-biologists" element={<Bioguide />} />
          <Route path="/lab-team" element={<LabTeam />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/dca-task-list" element={<DCATaskList />} />
          <Route path="/tasks" element={<ViewTasks />} />
          <Route path="/test" element={<ApiTest />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/" element={
          <>
         
            <UnifiedTopBar />
            <main>
              <section className="web-servers">
                <h2>Tools</h2>
                <hr />
                <div className="server-cards">
                  <Tile
                    toolName="Coevolving Pairs"
                    description="Estimates possible protein structure using pairs of amino acids that tend to evolve together"
                    link="/coevolving-pairs"
                    imageSrc={CoevolvingPairsThumbnail}
                  />
                  <Tile
                    toolName="Latent Generative Landscape"
                    description={<>Models complex dependencies in a sequence alignment by mapping high-dimensional structures to interpretable forms<br /><br /><i>Comming Soon!</i></>}
                    link="#"
                    imageSrc={LGLThumbnail}
                  />
                  <Tile
                    toolName="ProSSpeC"
                    description={<>ProSSpeC: Protease (NIa) Substrate Specificity Calculator<br/><br/>Calculates Hamiltonian Specificity function for Nuclear incision a proteases and potential protein substrates</>}
                    link="https://coevolutionary.org/prosspec"
                    imageSrc={prosspecLogo}
                  />
                  <Tile
                    toolName="Sequence Evolution with Epistatic Contributions"
                    description={<>SEEC<br/><br/>Simulates protein evolution using inferred epistasis from natural protein families.</>}
                    link="/seec"
                    imageSrc={seecLogo}      
                  />
                </div>
              </section>

              <section className='web-servers'>
                <h2>Related Projects</h2>
                <hr />
                <div className='server-cards'>
                  <Tile
                    toolName="ELIHKSIR"
                    description="Evolutionary Links Inferred for Histidine Kinase Sensors Interacting with Response regulators"
                    link="https://elihksir.org/"
                    imageSrc={elihksirLogo}
                  />
                  <Tile
                    toolName="DCA Scapes"
                    description="DNA recognition preference of Transcription factors through co-evolutionary modeling"
                    link="https://dcascapes.org/"
                    imageSrc={dcascapesLogo}
                  />
                  <Tile
                    toolName="Molecule Go"
                    description="MoleculeGo is an Educational Gaming App that lets you catch, build, and learn about molecules in the world around you!"
                    link="https://moleculego.com/"
                    imageSrc={molegulegoLogo}
                  />
                </div>
              </section>

             
              <section className="web-servers">
                <h2>Source Code</h2>
                <hr />
                <div className="server-cards">
                  <Tile
                    toolName="MfDCA Source Code"
                    description="View on GitHub"
                    link="https://github.com/utdal/py-mfdca"
                    imageSrc={githibLogo}
                  />
                  <Tile
                    toolName="SEEC Source Code"
                    description="View on GitHub"
                    link="https://github.com/utdal/seec-nt"
                    imageSrc={githibLogo}
                  />
                </div>
              </section>
            </main>
            <footer className="pretty-footer">
  <div className="footer-content">
    <div className="footer-left">
      <a href="https://morcoslaboratory.org/" target="_blank" rel="noopener noreferrer">
        Designed by the Evolutionary Information Lab
      </a>
    </div>
    <div className="footer-right">
      <a href="mailto:insert@gmail.com">
        <i className="fas fa-envelope"></i> faruckm@utdallas.edu
      </a>
    </div>
    <div className="footer-center">
      <div>
        <a href="https://www.utdallas.edu/" target="_blank" rel="noopener noreferrer">
          <img src={UTDLogo} alt="UTD Logo" className="utd-logo" />
        </a>
        <a href="https://www.rice.edu/">
          <img src={RiceLogo} alt="Rice Logo" className='rice-logo'/>
        </a>
      </div>
      <a href="https://nsf.gov/" target="_blank" rel="noopener noreferrer">
        <img src={nsfLogo} alt="NSF Logo" className="nsf-logo" />
      </a>
    </div>
  </div>
</footer>

          </>
          }/>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
