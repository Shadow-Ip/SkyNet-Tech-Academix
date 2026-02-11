-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: student_db
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Peter Slowman','peterSlow25','peter28slowman@skynet.co.za'),(2,'Lucky  Ngcobo','lucky22','luckyN@skynet.co.za');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `fullname` varchar(255) NOT NULL,
  `idNumber` varchar(13) NOT NULL,
  `studentNo` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `dateofBirth` date NOT NULL,
  `password` varchar(45) NOT NULL,
  `course` varchar(255) NOT NULL,
  `courseSummary` varchar(955) NOT NULL,
  `enrollmentDate` date NOT NULL,
  `status` varchar(45) NOT NULL,
  `registrationTimestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `studentid` (`studentNo`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `studentid_UNIQUE` (`studentNo`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `id_UNIQUE` (`idNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('Jake maslow','0408122245454','1212414sh45','maslow@skynet.co.za','2004-08-12','masilo','Full-Stack Dev','You\'ll learn to build complete web applications using HTML, CSS, JavaScript, React, TypeScript, Node.js, Python, and more.','2021-08-16','Awaiting Approval','2020-06-16 12:55:00'),('Masilo Lebepe','0407255362086','13ha2304374','13ha2304374@skynet.co.za','2004-07-25','John245','System Development','The process of designing, creating, testing, and implementing new software or customized systems to solve problems or meet user needs. It involves methodical phases, known as the System Development Life Cycle (SDLC), and can cover everything from internal custom software to integrating third-party applications. The goal is to produce high-quality, accurate systems that meet client requirements, often involving a collaborative team of specialists. ','2023-02-22','Graduated','2023-02-06 06:51:00'),('John Van Zumbuck','0109025556555','13ha321229','John@skynet.com','2001-09-02','John245','AI & Data Science','Introduces artificial intelligence, data analysis, and machine learning concepts for smart systems. This course is designed to equip individuals with the skills needed for careers such as data scientist, AI engineer, or data analyst, and often include hands-on projects, real-world case studies, and a strong theoretical foundation.','2025-10-06','Active','2025-10-19 13:11:32'),('May chai','0502045655456','4545122656','maychai@skynet.co.za','2005-02-04','MayJune','Networking','This course covers the foundation of networking and network devices, media, and protocols. Explores network configuration, maintenance, and security in enterprise and cloud environments.','2025-11-05','Pending','2025-11-07 12:40:19');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-26 17:01:06
