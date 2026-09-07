<img width="1600" height="781" alt="7acf30a8-c63f-43b2-90b1-13b25980b113" src="https://github.com/user-attachments/assets/3adbf1cb-7451-4378-82cf-954f3432b395" />
# RoundNest 💰

A web application for managing and visualizing personal savings, transactions, and investment data.

## 🚀 Project Overview

RoundNest is designed to provide a simple interface for organizing financial data and exploring savings and investment activity.

The project combines a web application with an AWS cloud-storage component for structured financial data.

The application focuses on organizing data into separate categories such as users, transactions, and investments, while keeping the project code managed through GitHub.

## ☁️ AWS Integration

Amazon S3 was configured as the cloud-storage component for the project.

The S3 bucket is organized into separate prefixes for different categories of application data.

### S3 Structure

```text
roundnest-cloud/
├── users/
├── transactions/
└── investment/
```

Each section contains CSV-based data relevant to that category.

### AWS Features Used

- Amazon S3
- S3 bucket organization
- S3 folder/prefix structure
- CSV data storage
- S3 Versioning

### Data Organization

The project separates the stored data into logical categories:

- **users/** — user-related data
- **transactions/** — transaction-related data
- **investment/** — investment-related data

This structure makes the stored data easier to organize and manage as the project grows.

## 🏗️ Architecture

```text
                    RoundNest Web App
                           │
                           ▼
                       GitHub
                    Source Control
                           │
                           ▼
                     Amazon S3
                  Cloud Storage Layer
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          users/      transactions/   investment/
             │             │             │
            CSV           CSV           CSV
```

The architecture separates the application source code from the cloud-based storage component.

GitHub is used for source-code management, while Amazon S3 provides structured cloud storage for the project's CSV data.

## 🛠️ Technologies

- JavaScript
- Node.js
- Web Development
- Amazon S3
- GitHub
- CSV
- Replit

## 📁 Project Structure

The repository contains the RoundNest application source code, configuration files, dependencies, scripts, and supporting assets.

The project is maintained using GitHub for source-code version control.

## 🔐 AWS Security & Access

The S3 bucket was configured as part of an AWS lab environment.

S3 Versioning was enabled to help maintain previous versions of objects stored in the bucket.

AWS permissions were controlled by the lab environment. Some IAM and EC2 operations were restricted by the provided AWS lab account.

Because of these environment restrictions, IAM role creation and EC2 deployment could not be completed within the lab session.

## 📊 Data Storage

The project uses CSV files to represent structured application data.

The data is separated into three primary categories:

```text
users/
transactions/
investment/
```

This organization provides a simple foundation for managing different types of application data in Amazon S3.

## 🔄 Version Control

GitHub is used to maintain the project's source code and track changes during development.

The repository provides a permanent place to store and document the project even after the temporary AWS lab environment expires.

## 🧪 AWS Lab Implementation

The AWS implementation included:

1. Creating an Amazon S3 bucket.
2. Creating logical prefixes for users, transactions, and investment data.
3. Uploading CSV datasets to the appropriate locations.
4. Enabling S3 Versioning.
5. Exploring IAM roles and EC2 deployment as part of the cloud architecture.
6. Working within the permission boundaries of the AWS lab environment.

Some AWS services and IAM operations were restricted by the lab environment and therefore could not be completed.

## 📸 AWS Evidence

The repository includes screenshots documenting the AWS implementation, including the S3 bucket structure and uploaded data.

These screenshots provide evidence of the cloud-storage configuration completed during the AWS lab.

## 📌 Future Improvements

The project can be extended with additional cloud and deployment capabilities.

Planned improvements include:

- Deploy the application on Amazon EC2
- Connect the application directly to Amazon S3 using the AWS SDK
- Add user authentication
- Add a database for persistent application data
- Implement automated deployment using GitHub Actions
- Add monitoring and logging
- Improve application security
- Add a production-ready cloud architecture

## 🎯 Learning Outcomes

Through this project, I explored:

- Web application development
- GitHub-based version control
- Cloud storage using Amazon S3
- S3 bucket organization
- CSV-based data management
- S3 Versioning
- AWS IAM concepts
- EC2 deployment concepts
- Cloud architecture fundamentals
- Working with AWS services within a restricted lab environment

## 👩‍💻 Author

**Diya Soni**

GitHub: [@diyadotdev](https://github.com/diyadotdev)

---

## ⭐ Project Status

**Current Status:** Development / AWS Prototype

The core application and AWS S3 storage structure have been established. Further deployment and direct application-to-S3 integration are planned as future improvements.




