pipeline {
    agent any
    environment {
      CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    }

    stages {

        stage('Prepare Directories') {
            steps {
                sh '''
                   # Create directory structure with proper permissions
                    mkdir -p "${CERT_DIR}"
                    chmod 700 "${CERT_DIR}"
                    ls -al "${CERT_DIR}"
                '''
            }
        }

        stage('Deploy Certificates') {

            steps {
                script {
                     // Using secret files
                      withCredentials([
                         file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
                         file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
                      ]) {
                          sh """
                              # Copy certificates
                              cp "$SSL_CERT" "${CERT_DIR}/certificate.crt"
                              cp "$SSL_KEY" "${CERT_DIR}/private.key"

                              # Set proper permissions
                              chmod 644 "${CERT_DIR}/certificate.crt"
                              chmod 600 "${CERT_DIR}/private.key"

                          """
                     }
                }
            }
        }

        stage('Prepare SSL Volume') {
            steps {
                script {
                    sh '''
                        # First create or clear the volume
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "rm -rf /ssl/* && mkdir -p /ssl"

                        # Then copy the certificates from the workspace
                        docker cp "${CERT_DIR}/." $(docker create --rm -v jenkins_ssl_certs:/ssl alpine sh):/ssl/

                        # Finally set the permissions
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "
                            chmod 644 /ssl/certificate.crt && \
                            chmod 600 /ssl/private.key
                        "

                    '''
                }
            }
        }

        stage("Build and start docker compose services") {
          steps {
            sh '''
               cd ./apps/money-tracker-ui/jenkins
               docker compose stop
               docker stop clematis-money-tracker-ui || true && docker rm clematis-money-tracker-ui || true
               docker stop clematis-money-tracker-ui-demo || true && docker rm clematis-money-tracker-ui-demo || true
               docker compose build
               docker compose up -d
            '''
          }
        }

    }

    post {
        always {
           // Clean up sensitive files after use
          sh '''
              if [ -d "${CERT_DIR}" ]; then rm -rf "${CERT_DIR}"; fi
           '''
        }
    }
}