FROM jfrog-artifactory.dev-tools.cloud.umtb.co.il/docker-remote/node:22-alpine

# Set working directory
WORKDIR /app/mfe-{<MFE NAME>}

# Copy package.json for dependency installation
COPY package.json .

# Handle certificate for npm to be able to download from artifactory
ARG CERTIFICATE_CONTENT
RUN echo "$CERTIFICATE_CONTENT" > /tmp/certificate.pem
RUN echo "Certification written to /tmp/certificate.pem"
RUN ls -l /tmp/certificate.pem
RUN npm config set cafile /tmp/certificate.pem

# Install dependencies
RUN npm install --registry=https://jfrog-artifactory.dev-tools.cloud.umtb.co.il/artifactory/api/npm/npm-local-remote-virtual/ --verbose

# Copy the rest of the files
COPY . .

# Build the microfrontend bundle
RUN npm run build

# Rename the bundle folder to the microfrontend's name
# This allows it to reside side-by-side with other microfrontends 
# in the nginx-based image built from the shell's dockerfile
RUN mv dist mfe-{<MFE NAME>}

# Archive the bundled microfrontend for extraction by the CI 
# and placement in the artifactory
RUN tar -czvf mfe-{<MFE NAME>}.tar.gz mfe-{<MFE NAME>}