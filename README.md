# VAN-GUARD

## Satellite Forest Loss Monitoring System

**VAN-GUARD** is an AI-assisted environmental monitoring and educational platform designed to visualize possible forest-loss patterns across India using satellite-supported observations.

The prototype combines Sentinel-1 radar data, Sentinel-2 optical imagery, before-and-after comparisons, vegetation-index analysis, cloud and shadow handling, and AI-assisted change detection in a clean geospatial dashboard.

> **Important disclaimer:** VAN-GUARD is an AI-assisted environmental monitoring prototype. Displayed incidents and measurements may use demonstration data. Satellite-detected land-cover change does not independently establish the cause or legal status of an activity.

## Live Application

**Frontend:** [Open VAN-GUARD](https://vankavach.vercel.app/)

## Project Purpose

VAN-GUARD helps users explore:

- Where possible forest loss may be occurring
- How severe the detected vegetation decline may be
- How much land may be affected
- Which satellite observations support the result
- Whether clouds, shadows, or seasonal variation influenced the assessment
- How an AI model can learn forest-change patterns from labelled historical examples

The interface is intended for environmental education, research demonstrations, conservation use cases, public-sector presentations, and hackathons. It does not claim to provide live government monitoring, guaranteed accuracy, legal conclusions, or automated enforcement.

## Key Features

- India-focused interactive forest-change map
- Severity-based markers for possible forest loss
- Sentinel-1 radar and Sentinel-2 optical evidence summaries
- Google Earth Engine-based satellite-processing workflow
- Earlier-versus-recent observation comparison
- Twelve-month vegetation timeline
- Seasonal-pattern filtering
- Cloud and cloud-shadow quality indicators
- Radar-assisted assessments when optical imagery is unavailable
- Location cards with affected-area and evidence summaries
- Filtering by severity, region, evidence source, disturbance category, and data quality
- Responsive layouts for desktop, tablet, and mobile
- Accessible controls, labels, focus states, and reduced-motion support
- Educational explanation of the AI model workflow

## Demonstration Workflow

1. Historical forest-change examples are assigned verified labels.
2. Sentinel-1 and Sentinel-2 observations are cleaned, aligned, and prepared.
3. Before-and-after examples are used to train the detection model.
4. Entire unseen regions are reserved for testing.
5. New satellite observations are analysed for persistent land-cover change.
6. Possible forest-loss locations appear on the map.
7. Each observation receives an illustrative severity level and supporting context.

Severity is estimated using a combination of affected area, vegetation decline, radar-supported structural change, temporal persistence, rate of expansion, and evidence quality. No single measurement independently determines severity.

## Severity Scale

| Severity | Colour | Interpretation |
|---|---|---|
| Minimal / Seasonal | `#22C55E` | Seasonal variation, recovery, or no persistent loss |
| Low | `#84CC16` | Limited or weakly persistent detected change |
| Moderate | `#EAB308` | Noticeable and persistent vegetation decline |
| High | `#F97316` | Significant or expanding forest-cover decline |
| Critical | `#DC2626` | Extensive or rapidly expanding possible forest loss |
| Insufficient Data | `#64748B` | Available observations do not support a reliable assessment |

Colours indicate severity only. Disturbance categories are shown separately as text and do not determine marker colour.

## Demonstration Locations

The prototype includes illustrative scenarios for:

- Keonjhar, Odisha
- Singrauli, Madhya Pradesh
- Dima Hasao, Assam
- Shimoga, Karnataka
- Bastar, Chhattisgarh
- Kanha Buffer, Madhya Pradesh

These scenarios are included for interface demonstration and education. They are not presented as live operational detections or proof of illegal activity.

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Leaflet.js for interactive geospatial visualization
- Responsive and accessible component design
- Vercel for frontend deployment

### Backend and Processing

- Backend service deployed on Render
- Google Cloud API credentials configured securely on the backend or deployment platform
- Google Earth Engine integration for satellite-image access and geospatial processing
- Sentinel-2 multispectral optical observations
- Sentinel-1 C-band SAR observations

## High-Level Architecture

```text
User Browser
     |
     v
Vercel Frontend
     |
     | HTTPS API requests
     v
Render Backend
     |
     | Authenticated geospatial requests
     v
Google Cloud / Google Earth Engine
     |
     +--> Sentinel-2 optical observations
     +--> Sentinel-1 radar observations
     +--> Before-and-after processing outputs
```

## Data-Processing Concept

A typical VAN-GUARD analysis can include:

1. Selecting a region and observation periods
2. Loading earlier and recent Sentinel observations
3. Applying cloud, cloud-shadow, and invalid-pixel masks
4. Aligning optical, radar, and labelled data to a common grid
5. Calculating vegetation-change indicators such as NDVI difference
6. Comparing temporal persistence and seasonal baselines
7. Reviewing radar-supported structural change
8. Producing possible forest-loss observations with severity and data-quality context

Actual implementation details depend on the Earth Engine scripts, backend endpoints, model assets, and credentials configured for the deployment.

## Local Development

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Configure the frontend

If the frontend is a static single-file build, open `index.html` directly in a browser. If the repository contains a framework-based frontend, use the scripts and package manager defined in its `package.json`.

Configure the backend base URL using the environment-variable mechanism used by the frontend. For example:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Use the actual variable name expected by the codebase.

### 3. Configure the backend

Create a backend environment file from the repository's example file, if available:

```bash
cp .env.example .env
```

Typical server-side settings may include:

```env
PORT=8000
CORS_ORIGIN=https://vankavach.vercel.app
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/secure/path/to/service-account.json
```

Only retain variables that are actually used by the backend.

### 4. Run the application

Use the commands documented in the frontend and backend package manifests. Common examples are:

```bash
npm install
npm run dev
```

and, for a Python backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Replace these examples with the exact commands used by this repository.

## Deployment

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Select the frontend root directory.
3. Add the frontend environment variables.
4. Configure the production backend URL.
5. Deploy the project.

### Backend on Render

1. Create a Web Service connected to the backend repository or directory.
2. Configure the runtime, build command, and start command used by the backend.
3. Add Google Cloud and application environment variables through Render's secret management.
4. Restrict CORS to the deployed frontend origin.
5. Deploy the service and use its public HTTPS URL in the frontend configuration.

## Environment Variables and Secret Safety

Never commit API keys, OAuth tokens, service-account JSON files, or private Earth Engine credentials to GitHub.

Recommended safeguards:

- Store frontend-safe configuration in Vercel environment variables.
- Store private credentials and service-account material only in Render secrets or another server-side secret manager.
- Keep privileged Google Earth Engine calls on the backend.
- Restrict Google Cloud credentials to the minimum required permissions.
- Restrict API keys by API, application, domain, IP address, or service account where applicable.
- Add local secret files to `.gitignore`.
- Rotate any credential that has previously been committed or exposed.

Suggested `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
service-account*.json
credentials*.json
node_modules/
.venv/
__pycache__/
dist/
build/
```

## API Documentation

Document each backend route using the following format:

```text
METHOD /api/example
Purpose: Describe what the endpoint returns.
Request: List required query parameters or JSON fields.
Response: Show a minimal response example.
Errors: Document expected status codes and safe error messages.
```

Avoid exposing backend stack traces, Earth Engine credentials, internal asset identifiers, or private Google Cloud project details in API responses.

## Accessibility

The interface is designed around:

- Keyboard-accessible controls
- Visible focus indicators
- Text labels in addition to severity colours
- Sufficient colour contrast
- Large touch targets
- ARIA labels where appropriate
- Readable chart labels
- Reduced-motion support
- Accessible descriptions for important visual content

## Responsible Use

VAN-GUARD presents possible land-cover change, not proof of a specific cause or legal violation. Outputs should be interpreted alongside field evidence, official land records, ecological context, seasonal conditions, and qualified human review before decisions are made.

Do not use demonstration incidents or illustrative measurements as factual claims about a location, organization, or person.

## Current Limitations

- Demonstration records may not represent current ground conditions.
- Optical observations may be blocked by clouds or cloud shadows.
- Seasonal vegetation cycles can resemble forest loss.
- Radar and optical signals can respond differently to terrain, moisture, agriculture, fire, and other environmental conditions.
- Estimated affected area and severity depend on preprocessing, thresholds, temporal coverage, and evidence quality.
- Satellite-supported observations alone cannot determine intent, legality, ownership, or responsibility.

## Future Enhancements

- Improved regional and seasonal baselines
- Better multimodal fusion of optical and radar observations
- Transparent confidence and uncertainty explanations
- Region-held-out model evaluation
- Additional accessibility testing
- More detailed API and processing documentation
- Improved fallback behavior for unavailable map tiles or satellite services

## Contributing

Contributions that improve usability, accessibility, scientific clarity, responsible terminology, geospatial processing, or documentation are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test the change.
4. Keep credentials and sensitive configuration out of commits.
5. Open a pull request describing the change and its user impact.

## License

Add the license selected for this repository, such as MIT, Apache-2.0, or another license appropriate for the project and its dependencies.

## Acknowledgements

- Google Earth Engine
- Google Cloud
- Copernicus Sentinel-1 mission data
- Copernicus Sentinel-2 mission data
- Leaflet.js
- OpenStreetMap contributors
- Esri World Imagery, where used in the interface
- Vercel
- Render

---

**VAN-GUARD // Satellite Forest Loss Monitoring System**  
Environmental monitoring and educational prototype using satellite-supported demonstration data.
