const mongoose = require('mongoose');
const HealthRecord = require('./models/HealthRecord');
const User = require('./models/User');
require('dotenv').config();

async function createSampleHealthRecords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    
    // Check existing health records
    const existingRecords = await HealthRecord.countDocuments();
    console.log(`📋 Existing health records: ${existingRecords}`);
    
    if (existingRecords > 0) {
      console.log('📝 Health records already exist. Do you want to add more? (y/n)');
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Continue? (y/n): ', (answer) => {
          rl.close();
          resolve(answer.trim().toLowerCase());
        });
      });
      
      if (answer !== 'y') {
        console.log('Exiting...');
        return;
      }
    }
    
    // Create sample health records for each user
    console.log('🏥 Creating sample health records...\n');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`Creating records for ${user.firstName} ${user.lastName}...`);
      
      // Create multiple health records for variety
      const sampleRecords = [
        {
          userId: user._id,
          checkupDate: new Date('2025-09-21'),
          checkupType: 'Follow-up',
          vitals: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: { value: 72 },
            temperature: { value: 36.5 },
            weight: { value: 70 },
            height: { value: 175 },
            oxygenSaturation: { value: 98 }
          },
          currentSymptoms: ['Follow-up checkup', 'No current symptoms'],
          diagnosis: [{
            condition: 'Heart Attack',
            severity: 'Moderate',
            status: 'Under Treatment',
            notes: 'Patient recovering well, medication compliance good'
          }],
          treatment: {
            prescribedMedicines: [{
              name: 'Aspirin',
              dosage: '75mg',
              frequency: 'Once daily',
              duration: '3 months',
              instructions: 'Take after breakfast'
            }],
            recommendations: ['Regular exercise', 'Low sodium diet', 'Stress management']
          },
          doctor: {
            name: 'Dr. Patil',
            specialization: 'Cardiology',
            hospital: 'Government Medical College Hospital',
            contactNumber: '9876543210'
          },
          followUp: {
            required: true,
            nextAppointment: new Date('2025-10-21'),
            instructions: 'Continue medication, report any chest pain immediately'
          },
          labResults: [{
            testName: 'ECG',
            result: 'Normal sinus rhythm',
            status: 'Normal',
            labName: 'Cardiac Lab',
            testDate: new Date('2025-09-20')
          }],
          notes: 'Patient shows good recovery progress. Continue current treatment plan.',
          status: 'Active'
        },
        {
          userId: user._id,
          checkupDate: new Date('2025-08-15'),
          checkupType: 'Emergency',
          vitals: {
            bloodPressure: { systolic: 160, diastolic: 100 },
            heartRate: { value: 110 },
            temperature: { value: 37.2 },
            weight: { value: 70 },
            height: { value: 175 }
          },
          currentSymptoms: ['Chest pain', 'Shortness of breath', 'Sweating'],
          diagnosis: [{
            condition: 'Acute Myocardial Infarction',
            severity: 'Severe',
            status: 'Resolved',
            notes: 'Emergency intervention successful'
          }],
          treatment: {
            prescribedMedicines: [{
              name: 'Clopidogrel',
              dosage: '75mg',
              frequency: 'Once daily',
              duration: '1 year',
              instructions: 'Take with food'
            }],
            procedures: [{
              name: 'Angioplasty',
              date: new Date('2025-08-15'),
              notes: 'Successful stent placement in LAD artery'
            }],
            recommendations: ['Complete bed rest for 24 hours', 'Cardiac rehabilitation program']
          },
          doctor: {
            name: 'Dr. Sharma',
            specialization: 'Emergency Cardiology',
            hospital: 'Government Medical College Hospital',
            contactNumber: '9876543211'
          },
          followUp: {
            required: true,
            nextAppointment: new Date('2025-08-22'),
            instructions: 'Follow-up in 1 week for medication adjustment'
          },
          notes: 'Emergency treatment successful. Patient stable.',
          status: 'Completed'
        },
        {
          userId: user._id,
          checkupDate: new Date('2025-07-10'),
          checkupType: 'Routine',
          vitals: {
            bloodPressure: { systolic: 140, diastolic: 90 },
            heartRate: { value: 80 },
            temperature: { value: 36.8 },
            weight: { value: 72 },
            height: { value: 175 }
          },
          currentSymptoms: ['Mild fatigue', 'Occasional headaches'],
          diagnosis: [{
            condition: 'Hypertension',
            severity: 'Mild',
            status: 'Active',
            notes: 'Newly diagnosed, requires lifestyle modification'
          }],
          treatment: {
            prescribedMedicines: [{
              name: 'Amlodipine',
              dosage: '5mg',
              frequency: 'Once daily',
              duration: '3 months',
              instructions: 'Take in the morning'
            }],
            recommendations: ['Low salt diet', 'Regular exercise', 'Weight management']
          },
          doctor: {
            name: 'Dr. Kumar',
            specialization: 'General Medicine',
            hospital: 'Community Health Center',
            contactNumber: '9876543212'
          },
          followUp: {
            required: true,
            nextAppointment: new Date('2025-10-10'),
            instructions: 'Monitor blood pressure daily'
          },
          labResults: [{
            testName: 'Lipid Profile',
            result: 'Total Cholesterol: 220 mg/dL',
            status: 'Abnormal',
            normalRange: '<200 mg/dL',
            labName: 'Path Lab',
            testDate: new Date('2025-07-08')
          }],
          notes: 'Routine checkup revealed elevated blood pressure. Started on medication.',
          status: 'Active'
        }
      ];
      
      // Create records
      for (const recordData of sampleRecords) {
        // Check if similar record already exists
        const existingRecord = await HealthRecord.findOne({
          userId: user._id,
          checkupDate: recordData.checkupDate,
          checkupType: recordData.checkupType
        });
        
        if (!existingRecord) {
          const record = new HealthRecord(recordData);
          await record.save();
          console.log(`  ✅ Created ${recordData.checkupType} record from ${recordData.checkupDate.toDateString()}`);
        } else {
          console.log(`  ⚠️  ${recordData.checkupType} record from ${recordData.checkupDate.toDateString()} already exists`);
        }
      }
    }
    
    const totalRecords = await HealthRecord.countDocuments();
    console.log(`\n🎉 Sample health records created successfully!`);
    console.log(`📊 Total health records in database: ${totalRecords}`);
    
    // Show summary by user
    console.log('\n📋 Records by user:');
    for (const user of users) {
      const userRecords = await HealthRecord.countDocuments({ userId: user._id });
      console.log(`   ${user.firstName} ${user.lastName}: ${userRecords} records`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

createSampleHealthRecords();