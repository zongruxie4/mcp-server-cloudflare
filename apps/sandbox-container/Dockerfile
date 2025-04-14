# Use an official Ubuntu as a base image
FROM ubuntu:20.04

# Set non-interactive mode to avoid prompts during package installation
ARG DEBIAN_FRONTEND=noninteractive

# Use bash for the shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Update and install useful CLI utilities
RUN apt-get update && apt-get install -y \
    curl \
    git \
    htop \
    vim \
    wget \
    net-tools \
    build-essential \
    nmap \
    sudo \
    ca-certificates \
    lsb-release \
    nodejs \
    npm \
    python3 \
    python3-pip \
    && apt-get clean

RUN pip3 install matplotlib numpy pandas

# Install Node.js and Corepack
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable

# ENV NODE_VERSION 22.14.0

# Download and install nvm
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | PROFILE="${BASH_ENV}" bash
# RUN echo node > .nvmrc
# RUN nvm install $NODE_VERSION
# RUN nvm use $NODE_VERSION

# Set working directory
WORKDIR /app

# Expose the port your Node.js server will run on
EXPOSE 8080

COPY . ./

RUN npm i

# add node and npm to path so the commands are available
# ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
# ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Default command (run your Node.js server here)
CMD ["npm", "run", "start:container"]